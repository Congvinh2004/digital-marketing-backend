const db = require('../database/models');
const { Op } = require('sequelize');

// Tạo đơn hàng
let createOrder = (bodyData, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { items, shipping_address_id, total_amount_usd, currency = 'USD' } = bodyData;

			// Validation
			if (!items || !Array.isArray(items) || items.length === 0) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: items (array of products)'
				});
				return;
			}

			if (!shipping_address_id) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: shipping_address_id'
				});
				return;
			}

			// Kiểm tra user có tồn tại không
			const user = await db.User.findOne({
				where: { id: userId, status: 'active' }
			});

			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'User not found or inactive'
				});
				return;
			}

			// Kiểm tra hoặc tạo customer từ user
			let customer = await db.Customer.findOne({
				where: { email: user.email }
			});

			if (!customer) {
				customer = await db.Customer.create({
					full_name: user.full_name || user.email,
					email: user.email,
					phone: user.phone,
					status: 'active'
				});
			}

			// Kiểm tra địa chỉ giao hàng
			const address = await db.Address.findOne({
				where: { id: shipping_address_id, customer_id: customer.id }
			});

			if (!address) {
				resolve({
					errCode: 3,
					errMessage: 'Shipping address not found'
				});
				return;
			}

			// Validate và tính toán tổng tiền
			let totalAmount = 0; // VNĐ (để lưu vào database)
			let totalAmountUSD = total_amount_usd ? parseFloat(total_amount_usd) : null; // USD (từ frontend)
			const orderItems = [];

			for (const item of items) {
				if (!item.product_id || !item.quantity) {
					resolve({
						errCode: 1,
						errMessage: 'Each item must have product_id and quantity'
					});
					return;
				}

				// Lấy thông tin sản phẩm
				const product = await db.Product.findOne({
					where: { id: item.product_id }
				});

				if (!product) {
					resolve({
						errCode: 4,
						errMessage: `Product with id ${item.product_id} not found`
					});
					return;
				}

				// Kiểm tra số lượng tồn kho
				if (product.quantity < item.quantity) {
					resolve({
						errCode: 5,
						errMessage: `Insufficient stock for product ${product.productName}. Available: ${product.quantity}, Requested: ${item.quantity}`
					});
					return;
				}

				const unitPrice = parseFloat(product.price); // Giá VNĐ từ database
				const quantity = parseInt(item.quantity);
				const itemTotal = unitPrice * quantity;

				totalAmount += itemTotal; // Tổng VNĐ

				orderItems.push({
					product_id: product.id,
					quantity: quantity,
					unit_price: unitPrice // Lưu giá VNĐ vào order_item
				});
			}

			// Nếu frontend không gửi total_amount_usd, tính từ VNĐ (tỷ giá mặc định)
			if (!totalAmountUSD && totalAmount > 0) {
				// Có thể tính quy đổi nếu cần, nhưng tốt nhất là frontend gửi sẵn
				// totalAmountUSD = totalAmount / 25000; // Ví dụ tỷ giá
			}

			// Tạo đơn hàng với transaction để đảm bảo tính toàn vẹn dữ liệu
			const transaction = await db.sequelize.transaction();

			try {
				// Tạo order
				// Lưu total_amount (VNĐ) vào database, total_amount_usd sẽ được lưu riêng hoặc dùng cho PayPal
				const order = await db.Order.create({
					customer_id: customer.id,
					user_id: userId,
					status: 'pending',
					total_amount: totalAmount, // VNĐ
					shipping_address_id: shipping_address_id
				}, { transaction });

				// Lưu total_amount_usd và currency vào payment record để dùng cho PayPal
				if (totalAmountUSD) {
					// Có thể lưu vào một field riêng hoặc metadata
					// Tạm thời lưu vào payment record
				}

				// Tạo order items
				for (const item of orderItems) {
					await db.OrderItem.create({
						order_id: order.id,
						product_id: item.product_id,
						quantity: item.quantity,
						unit_price: item.unit_price
					}, { transaction });

					// Giảm số lượng tồn kho
					await db.Product.decrement('quantity', {
						by: item.quantity,
						where: { id: item.product_id },
						transaction
					});
				}

				// Tạo payment record với status pending
				await db.Payment.create({
					orderId: order.id,
					paymentMethod: 'paypal',
					paymentStatus: 'pending',
					paymentDate: null,
					totalAmountUSD: totalAmountUSD, // Lưu giá USD từ frontend
					currency: currency || 'USD'
				}, { transaction });

				await transaction.commit();

				// Lấy order với đầy đủ thông tin
				const orderWithDetails = await db.Order.findOne({
					where: { id: order.id },
					include: [
						{
							model: db.Customer,
							as: 'customer',
							attributes: ['id', 'full_name', 'email', 'phone']
						},
						{
							model: db.Address,
							as: 'shipping_address',
							attributes: ['id', 'full_name', 'phone', 'province', 'district', 'ward', 'detail']
						},
						{
							model: db.OrderItem,
							as: 'items',
							include: [
								{
									model: db.Product,
									as: 'product',
									attributes: ['id', 'productName', 'price', 'image']
								}
							]
						}
					],
					raw: false,
					nest: true
				});

				resolve({
					errCode: 0,
					errMessage: 'Order created successfully',
					data: orderWithDetails
				});
			} catch (error) {
				await transaction.rollback();
				throw error;
			}
		} catch (e) {
			reject(e);
		}
	});
};

// Cập nhật thanh toán PayPal
let updatePayment = (orderId, bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { paypal_order_id, paypal_transaction_id, payment_status } = bodyData;

			// Validation
			if (!orderId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: orderId'
				});
				return;
			}

			if (!paypal_order_id || !paypal_transaction_id) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: paypal_order_id and paypal_transaction_id'
				});
				return;
			}

			// Tìm order
			const order = await db.Order.findOne({
				where: { id: orderId },
				raw: false
			});

			if (!order) {
				resolve({
					errCode: 2,
					errMessage: 'Order not found'
				});
				return;
			}

			// Tìm payment record
			let payment = await db.Payment.findOne({
				where: { orderId: orderId },
				raw: false
			});

			if (!payment) {
				// Tạo payment record nếu chưa có
				payment = await db.Payment.create({
					orderId: orderId,
					paymentMethod: 'paypal',
					paymentStatus: payment_status || 'pending',
					paymentDate: null,
					paypalOrderId: paypal_order_id,
					paypalTransactionId: paypal_transaction_id
				});
			} else {
				// Cập nhật payment record
				payment.paypalOrderId = paypal_order_id;
				payment.paypalTransactionId = paypal_transaction_id;
				payment.paymentStatus = payment_status || payment.paymentStatus;
				
				if (payment_status === 'completed' || payment_status === 'paid') {
					payment.paymentDate = new Date();
					payment.paymentStatus = 'paid';
					
					// Cập nhật status của order
					order.status = 'paid';
					await order.save();
				}
				
				await payment.save();
			}

			// Lấy order với đầy đủ thông tin
			const orderWithDetails = await db.Order.findOne({
				where: { id: orderId },
				include: [
					{
						model: db.Customer,
						as: 'customer',
						attributes: ['id', 'full_name', 'email', 'phone']
					},
					{
						model: db.Address,
						as: 'shipping_address',
						attributes: ['id', 'full_name', 'phone', 'province', 'district', 'ward', 'detail']
					},
					{
						model: db.OrderItem,
						as: 'items',
						include: [
							{
								model: db.Product,
								as: 'product',
								attributes: ['id', 'productName', 'price', 'image']
							}
						]
					}
				],
				raw: false,
				nest: true
			});

			// Lấy payment info
			const paymentInfo = await db.Payment.findOne({
				where: { orderId: orderId },
				raw: false
			});

			resolve({
				errCode: 0,
				errMessage: 'Payment updated successfully',
				data: {
					order: orderWithDetails,
					payment: paymentInfo
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	createOrder: createOrder,
	updatePayment: updatePayment
};

