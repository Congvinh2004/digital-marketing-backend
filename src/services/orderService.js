const db = require('../database/models');
const { Op } = require('sequelize');

// Tạo đơn hàng
let createOrder = (bodyData, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { items, shipping_address_id, total_amount_usd, currency = 'USD', payment_method = 'paypal' } = bodyData;

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
			// Tìm customer theo email hoặc phone (vì cả hai đều unique)
			// Chỉ tìm theo phone nếu phone có giá trị
			let whereCondition = { email: user.email };
			if (user.phone && user.phone.trim() !== '') {
				whereCondition = {
					[Op.or]: [
						{ email: user.email },
						{ phone: user.phone }
					]
				};
			}

			let customer = await db.Customer.findOne({
				where: whereCondition
			});

			if (!customer) {
				// Tạo customer mới nếu chưa tồn tại
				try {
					customer = await db.Customer.create({
						full_name: user.full_name || user.email,
						email: user.email,
						phone: user.phone || null,
						status: 'active'
					});
				} catch (error) {
					// Nếu bị lỗi duplicate (có thể do race condition), thử tìm lại
					if (error.name === 'SequelizeUniqueConstraintError' || error.code === 'ER_DUP_ENTRY') {
						// Tìm lại customer sau khi bị duplicate
						customer = await db.Customer.findOne({
							where: whereCondition
						});
						
						if (!customer) {
							// Nếu vẫn không tìm thấy, có thể do duplicate phone hoặc email
							// Thử tìm lại với cả hai điều kiện
							if (user.phone && user.phone.trim() !== '') {
								customer = await db.Customer.findOne({
									where: {
										[Op.or]: [
											{ email: user.email },
											{ phone: user.phone }
										]
									}
								});
							} else {
								customer = await db.Customer.findOne({
									where: { email: user.email }
								});
							}
						}
						
						if (!customer) {
							resolve({
								errCode: 6,
								errMessage: 'Failed to create customer. Email or phone already exists'
							});
							return;
						}
					} else {
						throw error;
					}
				}
			}

			// Kiểm tra địa chỉ giao hàng
			// Tìm address theo ID trước
			let address = await db.Address.findOne({
				where: { id: shipping_address_id }
			});

			if (!address) {
				resolve({
					errCode: 3,
					errMessage: 'Shipping address not found'
				});
				return;
			}

			// Kiểm tra address có thuộc về customer này không
			// Nếu không, cập nhật customer_id để đảm bảo address thuộc về customer đúng
			if (address.customer_id !== customer.id) {
				// Cập nhật customer_id của address
				address.customer_id = customer.id;
				await address.save();
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

					// Tăng số lượng đã bán
					await db.Product.increment('sold_quantity', {
						by: item.quantity,
						where: { id: item.product_id },
						transaction
					});
				}

				// Tạo payment record với status pending
				await db.Payment.create({
					orderId: order.id,
					paymentMethod: payment_method, // Nhận từ frontend
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
			const { paypal_order_id, paypal_transaction_id, payment_status, payment_method } = bodyData;

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
					paymentMethod: payment_method || 'paypal', // Nhận từ frontend, mặc định là paypal
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
				
				// Cập nhật payment_method nếu có
				if (payment_method) {
					payment.paymentMethod = payment_method;
				}
				
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

// Cập nhật trạng thái thanh toán
let updatePaymentStatus = (orderId, paymentStatus) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Validation
			if (!orderId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: orderId'
				});
				return;
			}

			if (!paymentStatus) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: payment_status'
				});
				return;
			}

			// Kiểm tra payment_status hợp lệ
			const validStatuses = ['pending', 'paid', 'completed', 'failed', 'cancelled', 'refunded'];
			if (!validStatuses.includes(paymentStatus)) {
				resolve({
					errCode: 1,
					errMessage: `Invalid payment_status. Valid statuses: ${validStatuses.join(', ')}`
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
				resolve({
					errCode: 3,
					errMessage: 'Payment record not found for this order'
				});
				return;
			}

			// Lưu trạng thái cũ
			const oldPaymentStatus = payment.paymentStatus;

			// Cập nhật payment_status
			payment.paymentStatus = paymentStatus;

			// Nếu payment_status là 'paid' hoặc 'completed', cập nhật paymentDate và order status
			if (paymentStatus === 'paid' || paymentStatus === 'completed') {
				if (!payment.paymentDate) {
					payment.paymentDate = new Date();
				}
				
				// Cập nhật status của order thành 'paid' nếu chưa phải
				if (order.status === 'pending') {
					order.status = 'paid';
					await order.save();
				}
			}

			// Nếu payment_status là 'failed' hoặc 'cancelled', có thể giữ order ở pending
			// Hoặc có thể cập nhật order status tùy theo business logic

			await payment.save();

			// Lấy order với đầy đủ thông tin
			const orderWithDetails = await db.Order.findOne({
				where: { id: orderId },
				attributes: [
					'id',
					'customer_id',
					'user_id',
					'status',
					'total_amount',
					'shipping_address_id',
					'created_at',
					'updated_at'
				],
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
								attributes: ['id', 'productName', 'price', 'image', 'discount_percent']
							}
						]
					}
				],
				raw: false,
				nest: true
			});

			// Lấy payment info đã cập nhật
			const updatedPayment = await db.Payment.findOne({
				where: { orderId: orderId },
				raw: false
			});

			// Map order để thêm thông tin
			const orderObj = orderWithDetails.toJSON ? orderWithDetails.toJSON() : orderWithDetails;
			
			if (orderObj.shipping_address) {
				orderObj.customer_info = {
					full_name: orderObj.shipping_address.full_name,
					phone: orderObj.shipping_address.phone,
					email: orderObj.customer?.email || null
				};
			} else if (orderObj.customer) {
				orderObj.customer_info = {
					full_name: orderObj.customer.full_name,
					phone: orderObj.customer.phone,
					email: orderObj.customer.email
				};
			}
			
			if (updatedPayment) {
				orderObj.payment_method = updatedPayment.paymentMethod;
				orderObj.payment_status = updatedPayment.paymentStatus;
				orderObj.payment_date = updatedPayment.paymentDate;
			}
			
			orderObj.order_status = orderObj.status;

			resolve({
				errCode: 0,
				errMessage: 'Payment status updated successfully',
				data: {
					order: orderObj,
					payment: updatedPayment,
					oldPaymentStatus: oldPaymentStatus,
					newPaymentStatus: paymentStatus
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Cập nhật trạng thái đơn hàng
let updateOrderStatus = (orderId, newStatus) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Validation
			if (!orderId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: orderId'
				});
				return;
			}

			if (!newStatus) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: status'
				});
				return;
			}

			// Kiểm tra status hợp lệ
			const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
			if (!validStatuses.includes(newStatus)) {
				resolve({
					errCode: 1,
					errMessage: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
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

			// Kiểm tra logic chuyển trạng thái
			const currentStatus = order.status;
			
			// Không cho phép chuyển từ completed hoặc cancelled sang trạng thái khác
			if ((currentStatus === 'completed' || currentStatus === 'cancelled') && newStatus !== currentStatus) {
				resolve({
					errCode: 3,
					errMessage: `Cannot change status from '${currentStatus}' to '${newStatus}'. Order is already ${currentStatus}.`
				});
				return;
			}

			// Cập nhật status
			order.status = newStatus;
			await order.save();

			// Lấy order với đầy đủ thông tin
			const orderWithDetails = await db.Order.findOne({
				where: { id: orderId },
				attributes: [
					'id',
					'customer_id',
					'user_id',
					'status',
					'total_amount',
					'shipping_address_id',
					'created_at',
					'updated_at'
				],
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
								attributes: ['id', 'productName', 'price', 'image', 'discount_percent']
							}
						]
					}
				],
				raw: false,
				nest: true
			});

			// Lấy payment info để thêm payment_method
			const payment = await db.Payment.findOne({
				where: { orderId: orderId },
				raw: false
			});

			// Map order để thêm thông tin người dùng từ Address và payment_method
			const orderObj = orderWithDetails.toJSON ? orderWithDetails.toJSON() : orderWithDetails;
			
			// Lấy thông tin người dùng từ shipping_address (thông tin nhập thủ công)
			if (orderObj.shipping_address) {
				orderObj.customer_info = {
					full_name: orderObj.shipping_address.full_name,
					phone: orderObj.shipping_address.phone,
					email: orderObj.customer?.email || null // Email vẫn lấy từ Customer nếu có
				};
			} else if (orderObj.customer) {
				// Fallback về Customer nếu không có shipping_address
				orderObj.customer_info = {
					full_name: orderObj.customer.full_name,
					phone: orderObj.customer.phone,
					email: orderObj.customer.email
				};
			}
			
			// Thêm thông tin hình thức thanh toán vào order
			if (payment) {
				orderObj.payment_method = payment.paymentMethod;
				orderObj.payment_status = payment.paymentStatus;
				orderObj.payment_date = payment.paymentDate;
			}
			
			// Đảm bảo order_status luôn có (từ status của Order)
			orderObj.order_status = orderObj.status;

			resolve({
				errCode: 0,
				errMessage: 'Order status updated successfully',
				data: {
					order: orderObj,
					oldStatus: currentStatus,
					newStatus: newStatus
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Lấy danh sách đơn hàng
let getAllOrders = (queryParams) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { status, customer_id, user_id, page = 1, limit = 10 } = queryParams;
			const offset = (page - 1) * limit;

			// Xây dựng điều kiện where
			const whereCondition = {};
			
			if (status) {
				whereCondition.status = status;
			}
			
			if (customer_id) {
				whereCondition.customer_id = customer_id;
			}
			
			if (user_id) {
				whereCondition.user_id = user_id;
			}

			// Count orders trước (không có include để tránh duplicate)
			const count = await db.Order.count({
				where: whereCondition
			});

			// Query orders với include
			const orders = await db.Order.findAll({
				where: whereCondition,
				attributes: [
					'id',
					'customer_id',
					'user_id',
					'status',
					'total_amount',
					'shipping_address_id',
					'created_at',
					'updated_at'
				],
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
								attributes: ['id', 'productName', 'price', 'image', 'discount_percent']
							}
						]
					}
				],
				order: [['created_at', 'DESC']],
				limit: parseInt(limit),
				offset: parseInt(offset),
				raw: false,
				nest: true
			});

			// Lấy danh sách order IDs để query Payment
			const orderIds = orders.map(order => order.id);
			
			// Query Payment để lấy payment_method
			const payments = await db.Payment.findAll({
				where: {
					orderId: {
						[Op.in]: orderIds
					}
				},
				attributes: ['orderId', 'paymentMethod', 'paymentStatus', 'paymentDate'],
				raw: false
			});
			
			// Tạo map payment theo orderId
			const paymentMap = {};
			payments.forEach(payment => {
				paymentMap[payment.orderId] = payment;
			});

			// Map orders để thêm thông tin người dùng từ Address và payment_method
			const ordersWithUserInfo = orders.map(order => {
				const orderObj = order.toJSON ? order.toJSON() : order;
				
				// Lấy thông tin người dùng từ shipping_address (thông tin nhập thủ công)
				if (orderObj.shipping_address) {
					orderObj.customer_info = {
						full_name: orderObj.shipping_address.full_name,
						phone: orderObj.shipping_address.phone,
						email: orderObj.customer?.email || null // Email vẫn lấy từ Customer nếu có
					};
				} else if (orderObj.customer) {
					// Fallback về Customer nếu không có shipping_address
					orderObj.customer_info = {
						full_name: orderObj.customer.full_name,
						phone: orderObj.customer.phone,
						email: orderObj.customer.email
					};
				}
				
				// Thêm thông tin hình thức thanh toán
				if (paymentMap[orderObj.id]) {
					orderObj.payment_method = paymentMap[orderObj.id].paymentMethod;
					orderObj.payment_status = paymentMap[orderObj.id].paymentStatus;
					orderObj.payment_date = paymentMap[orderObj.id].paymentDate;
				}
				
				// Đảm bảo order_status luôn có (từ status của Order)
				orderObj.order_status = orderObj.status;
				
				return orderObj;
			});

			resolve({
				errCode: 0,
				errMessage: 'Get orders successfully',
				data: {
					orders: ordersWithUserInfo,
					pagination: {
						total: count,
						page: parseInt(page),
						limit: parseInt(limit),
						totalPages: Math.ceil(count / limit)
					}
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Lấy chi tiết đơn hàng
let getOrderById = (orderId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!orderId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: orderId'
				});
				return;
			}

			const order = await db.Order.findOne({
				where: { id: orderId },
				attributes: [
					'id',
					'customer_id',
					'user_id',
					'status',
					'total_amount',
					'shipping_address_id',
					'created_at',
					'updated_at'
				],
				include: [
					{
						model: db.Customer,
						as: 'customer',
						attributes: ['id', 'full_name', 'email', 'phone']
					},
					{
						model: db.User,
						as: 'user',
						attributes: ['id', 'email', 'full_name', 'phone'],
						required: false
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
								attributes: ['id', 'productName', 'price', 'image', 'discount_percent']
							}
						]
					}
				],
				raw: false,
				nest: true
			});

			if (!order) {
				resolve({
					errCode: 2,
					errMessage: 'Order not found'
				});
				return;
			}

			// Lấy payment info nếu có
			const payment = await db.Payment.findOne({
				where: { orderId: orderId },
				raw: false
			});

			// Map order để thêm thông tin người dùng từ Address và payment_method
			const orderObj = order.toJSON ? order.toJSON() : order;
			
			// Lấy thông tin người dùng từ shipping_address (thông tin nhập thủ công)
			if (orderObj.shipping_address) {
				orderObj.customer_info = {
					full_name: orderObj.shipping_address.full_name,
					phone: orderObj.shipping_address.phone,
					email: orderObj.customer?.email || orderObj.user?.email || null // Email lấy từ Customer hoặc User
				};
			} else if (orderObj.customer) {
				// Fallback về Customer nếu không có shipping_address
				orderObj.customer_info = {
					full_name: orderObj.customer.full_name,
					phone: orderObj.customer.phone,
					email: orderObj.customer.email
				};
			}
			
			// Thêm thông tin hình thức thanh toán vào order
			if (payment) {
				orderObj.payment_method = payment.paymentMethod;
				orderObj.payment_status = payment.paymentStatus;
				orderObj.payment_date = payment.paymentDate;
			}
			
			// Đảm bảo order_status luôn có (từ status của Order)
			orderObj.order_status = orderObj.status;

			resolve({
				errCode: 0,
				errMessage: 'Get order successfully',
				data: {
					order: orderObj,
					payment: payment || null
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	createOrder: createOrder,
	updatePayment: updatePayment,
	updatePaymentStatus: updatePaymentStatus,
	updateOrderStatus: updateOrderStatus,
	getAllOrders: getAllOrders,
	getOrderById: getOrderById
};

