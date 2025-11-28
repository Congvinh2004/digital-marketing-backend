const paypalService = require('../services/paypalService');
const orderService = require('../services/orderService');
const qrCodeService = require('../services/qrCodeService');
const db = require('../database/models');

// Tạo PayPal order từ order ID
let createPayPalOrder = async (req, res) => {
	try {
		const { orderId, returnUrl, cancelUrl } = req.body;

		if (!orderId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: orderId'
			});
		}

		// Lấy thông tin order
		const order = await db.Order.findOne({
			where: { id: orderId },
			include: [
				{
					model: db.OrderItem,
					as: 'items',
					include: [
						{
							model: db.Product,
							as: 'product',
							attributes: ['id', 'productName', 'price']
						}
					]
				}
			],
			raw: false,
			nest: true
		});

		if (!order) {
			return res.status(200).json({
				errCode: 2,
				errMessage: 'Order not found'
			});
		}

		// Lấy payment record để lấy total_amount_usd và currency
		const payment = await db.Payment.findOne({
			where: { orderId: orderId },
			raw: false
		});

		// Sử dụng giá USD từ payment nếu có, nếu không thì dùng giá VNĐ (không khuyến khích)
		const totalAmountUSD = payment?.totalAmountUSD ? parseFloat(payment.totalAmountUSD) : null;
		const currency = payment?.currency || 'USD';

		if (!totalAmountUSD) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Total amount USD not found. Please provide total_amount_usd when creating order.'
			});
		}

		// Chuẩn bị data cho PayPal (dùng giá USD)
		const items = order.items.map(item => ({
			name: item.product.productName,
			price: parseFloat(item.unit_price), // Giá VNĐ từ database (chỉ để hiển thị)
			quantity: item.quantity
		}));

		// Tính giá USD cho từng item (tỷ lệ với total)
		const totalVND = parseFloat(order.total_amount);
		const itemsWithUSD = items.map(item => {
			const itemTotalVND = item.price * item.quantity;
			const itemPriceUSD = totalVND > 0 ? (itemTotalVND / totalVND) * totalAmountUSD : 0;
			return {
				name: item.name,
				price: itemPriceUSD / item.quantity, // Giá USD cho 1 sản phẩm
				quantity: item.quantity
			};
		});

		const orderData = {
			total_amount: totalAmountUSD, // Dùng giá USD
			currency: currency,
			items: itemsWithUSD,
			returnUrl: returnUrl, // Nhận từ frontend (động theo domain)
			cancelUrl: cancelUrl  // Nhận từ frontend (động theo domain)
		};

		// Tạo PayPal order
		let response = await paypalService.createPayPalOrder(orderData);

		if (response.errCode === 0 && payment) {
			// Lưu PayPal order ID vào payment record
			payment.paypalOrderId = response.data.orderId;
			await payment.save();
		}

		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

// Capture PayPal payment
let capturePayPalOrder = async (req, res) => {
	try {
		const { paypal_order_id, orderId } = req.body;

		if (!paypal_order_id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: paypal_order_id'
			});
		}

		if (!orderId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: orderId'
			});
		}

		// Capture payment từ PayPal
		let captureResponse = await paypalService.capturePayPalOrder(paypal_order_id);

		if (captureResponse.errCode !== 0) {
			return res.status(200).json(captureResponse);
		}

		// Lấy transaction ID từ capture response
		const transactionId = captureResponse.data.transactionId || captureResponse.data.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
		const paymentStatus = (captureResponse.data.status === 'COMPLETED' || captureResponse.data.captureStatus === 'COMPLETED') ? 'paid' : 'pending';

		// Cập nhật payment trong database
		const paymentData = {
			paypal_order_id: paypal_order_id,
			paypal_transaction_id: transactionId,
			payment_status: paymentStatus,
			payment_method: req.body.payment_method || 'paypal' // Nhận từ frontend
		};

		let updateResponse = await orderService.updatePayment(orderId, paymentData);

		return res.status(200).json({
			errCode: 0,
			errMessage: 'Payment captured and updated successfully',
			data: {
				paypal: captureResponse.data,
				order: updateResponse.data
			}
		});
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

// Tạo QR code từ PayPal approval URL
let generatePayPalQRCode = async (req, res) => {
	try {
		const { approvalUrl, orderId } = req.body;

		if (!approvalUrl) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: approvalUrl'
			});
		}

		// Tạo QR code
		let response = await qrCodeService.generatePayPalQRCode(approvalUrl, {
			width: 400,
			margin: 3
		});

		if (response.errCode === 0 && orderId) {
			// Lưu QR code info vào payment record (optional)
			const payment = await db.Payment.findOne({
				where: { orderId: orderId },
				raw: false
			});

			if (payment) {
				// Có thể lưu QR code data URL vào database nếu cần
				// payment.qr_code_data = response.data.dataUrl;
				// await payment.save();
			}
		}

		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

// Tạo QR code từ order ID (tự động lấy approval URL)
let generateQRCodeByOrderId = async (req, res) => {
	try {
		const { orderId } = req.body;

		if (!orderId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: orderId'
			});
		}

		// Lấy payment record để lấy PayPal order ID
		const payment = await db.Payment.findOne({
			where: { orderId: orderId },
			raw: false
		});

		if (!payment || !payment.paypalOrderId) {
			// Nếu chưa có PayPal order, tạo mới
			const order = await db.Order.findOne({
				where: { id: orderId },
				include: [
					{
						model: db.OrderItem,
						as: 'items',
						include: [
							{
								model: db.Product,
								as: 'product',
								attributes: ['id', 'productName', 'price']
							}
						]
					}
				],
				raw: false,
				nest: true
			});

			if (!order) {
				return res.status(200).json({
					errCode: 2,
					errMessage: 'Order not found'
				});
			}

			// Lấy payment để lấy total_amount_usd
			const payment = await db.Payment.findOne({
				where: { orderId: orderId },
				raw: false
			});

			const totalAmountUSD = payment?.totalAmountUSD ? parseFloat(payment.totalAmountUSD) : null;
			const currency = payment?.currency || 'USD';

			if (!totalAmountUSD) {
				return res.status(200).json({
					errCode: 1,
					errMessage: 'Total amount USD not found. Please provide total_amount_usd when creating order.'
				});
			}

			// Tính giá USD cho từng item
			const totalVND = parseFloat(order.total_amount);
			const items = order.items.map(item => {
				const itemTotalVND = parseFloat(item.unit_price) * item.quantity;
				const itemPriceUSD = totalVND > 0 ? (itemTotalVND / totalVND) * totalAmountUSD : 0;
				return {
					name: item.product.productName,
					price: itemPriceUSD / item.quantity,
					quantity: item.quantity
				};
			});

			const orderData = {
				total_amount: totalAmountUSD,
				currency: currency,
				items: items
			};

			let paypalResponse = await paypalService.createPayPalOrder(orderData);

			if (paypalResponse.errCode !== 0) {
				return res.status(200).json(paypalResponse);
			}

			// Lưu PayPal order ID
			if (existingPayment) {
				existingPayment.paypalOrderId = paypalResponse.data.orderId;
				await existingPayment.save();
			}

			// Trả về QR code từ approval URL
			if (paypalResponse.data.qrCode) {
				return res.status(200).json({
					errCode: 0,
					errMessage: 'QR code generated successfully',
					data: {
						qrCode: paypalResponse.data.qrCode,
						approvalUrl: paypalResponse.data.approvalUrl,
						paypalOrderId: paypalResponse.data.orderId
					}
				});
			}

			// Nếu không có QR code trong response, tạo mới
			let qrResponse = await qrCodeService.generatePayPalQRCode(paypalResponse.data.approvalUrl);

			return res.status(200).json({
				errCode: 0,
				errMessage: 'QR code generated successfully',
				data: {
					qrCode: qrResponse.data.dataUrl,
					approvalUrl: paypalResponse.data.approvalUrl,
					paypalOrderId: paypalResponse.data.orderId
				}
			});
		} else {
			// Đã có PayPal order, cần lấy approval URL từ PayPal API
			// Hoặc tạo lại PayPal order để lấy approval URL
			// Tạm thời trả về lỗi yêu cầu tạo lại PayPal order
			return res.status(200).json({
				errCode: 3,
				errMessage: 'PayPal order already exists. Please use createPayPalOrder API first to get approval URL.'
			});
		}
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

module.exports = {
	createPayPalOrder: createPayPalOrder,
	capturePayPalOrder: capturePayPalOrder,
	generatePayPalQRCode: generatePayPalQRCode,
	generateQRCodeByOrderId: generateQRCodeByOrderId
};

