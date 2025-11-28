const db = require('../database/models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

// Tổng hợp doanh thu theo ngày
let getDailyRevenue = (queryParams) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Lấy ngày từ query params, mặc định là hôm nay
			let targetDate = queryParams?.date;
			
			if (!targetDate) {
				// Mặc định là hôm nay (theo local time, không phải UTC)
				const today = new Date();
				const year = today.getFullYear();
				const month = String(today.getMonth() + 1).padStart(2, '0');
				const day = String(today.getDate()).padStart(2, '0');
				targetDate = `${year}-${month}-${day}`; // Format: YYYY-MM-DD (local time)
			}

			// Tạo start và end của ngày (00:00:00 đến 23:59:59) theo local time
			const [year, month, day] = targetDate.split('-').map(Number);
			const startDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Local time
			const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Local time

			// Tính doanh thu từ Orders table - tính theo updated_at (khi order được completed)
			const orders = await db.Order.findAll({
				where: {
					status: 'completed',
					updated_at: {
						[Op.between]: [startDate, endDate]
					}
				},
				attributes: [
					'id',
					'total_amount',
					'status',
					'updated_at'
				],
				raw: false
			});

			// Lấy danh sách order IDs để query Payment
			const orderIds = orders.map(order => order.id);
			
			// Query Payment để lấy USD
			let totalRevenueUSD = 0;
			if (orderIds.length > 0) {
				const payments = await db.Payment.findAll({
					where: {
						orderId: {
							[Op.in]: orderIds
						}
					},
					attributes: ['orderId', 'totalAmountUSD']
				});
				
				payments.forEach(payment => {
					if (payment.totalAmountUSD) {
						totalRevenueUSD += parseFloat(payment.totalAmountUSD) || 0;
					}
				});
			}

			// Tính tổng doanh thu VNĐ
			let totalRevenue = 0;
			orders.forEach(order => {
				totalRevenue += parseFloat(order.total_amount) || 0;
			});
			
			const orderCount = orders.length;

			resolve({
				errCode: 0,
				errMessage: 'Get daily revenue successfully',
				data: {
					date: targetDate,
					revenue: {
						vnd: totalRevenue,
						usd: totalRevenueUSD,
						orderCount: orderCount
					},
					orders: orders.map(order => ({
						id: order.id,
						total_amount: parseFloat(order.total_amount),
						status: order.status,
						updated_at: order.updated_at ? new Date(order.updated_at).toISOString() : null
					}))
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Tổng hợp doanh thu theo tháng
let getMonthlyRevenue = (queryParams) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Lấy tháng và năm từ query params, mặc định là tháng hiện tại
			let year = queryParams?.year;
			let month = queryParams?.month;
			
			if (!year || !month) {
				// Mặc định là tháng hiện tại
				const today = new Date();
				year = today.getFullYear();
				month = today.getMonth() + 1; // getMonth() trả về 0-11
			}

			// Tạo start và end của tháng
			const startDate = new Date(year, month - 1, 1); // Tháng bắt đầu từ ngày 1
			startDate.setHours(0, 0, 0, 0);
			
			const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Ngày cuối cùng của tháng

			// Tính doanh thu từ Orders table - tính theo updated_at (khi order được completed)
			const orders = await db.Order.findAll({
				where: {
					status: 'completed',
					updated_at: {
						[Op.between]: [startDate, endDate]
					}
				},
				attributes: [
					'id',
					'total_amount',
					'status',
					'updated_at'
				],
				raw: false
			});

			// Lấy danh sách order IDs để query Payment
			const orderIds = orders.map(order => order.id);
			
			// Query Payment để lấy USD
			let totalRevenueUSD = 0;
			if (orderIds.length > 0) {
				const payments = await db.Payment.findAll({
					where: {
						orderId: {
							[Op.in]: orderIds
						}
					},
					attributes: ['orderId', 'totalAmountUSD']
				});
				
				payments.forEach(payment => {
					if (payment.totalAmountUSD) {
						totalRevenueUSD += parseFloat(payment.totalAmountUSD) || 0;
					}
				});
			}

			// Tính tổng doanh thu VNĐ
			let totalRevenue = 0;
			orders.forEach(order => {
				totalRevenue += parseFloat(order.total_amount) || 0;
			});
			
			const orderCount = orders.length;

			// Tính doanh thu theo từng ngày trong tháng (theo updated_at của order)
			const dailyBreakdown = {};
			orders.forEach(order => {
				// Kiểm tra và xử lý date an toàn
				if (!order.updated_at) return; // Bỏ qua nếu không có date
				
				try {
					const orderDateObj = new Date(order.updated_at);
					// Kiểm tra date hợp lệ
					if (isNaN(orderDateObj.getTime())) return; // Bỏ qua nếu date không hợp lệ
					
					// Format date theo local time (YYYY-MM-DD)
					const year = orderDateObj.getFullYear();
					const month = String(orderDateObj.getMonth() + 1).padStart(2, '0');
					const day = String(orderDateObj.getDate()).padStart(2, '0');
					const orderDate = `${year}-${month}-${day}`;
					
					if (!dailyBreakdown[orderDate]) {
						dailyBreakdown[orderDate] = {
							date: orderDate,
							revenue: 0,
							orderCount: 0
						};
					}
					dailyBreakdown[orderDate].revenue += parseFloat(order.total_amount) || 0;
					dailyBreakdown[orderDate].orderCount += 1;
				} catch (error) {
					console.error('Error processing order date:', error, order.id);
					// Bỏ qua order này nếu có lỗi
				}
			});

			resolve({
				errCode: 0,
				errMessage: 'Get monthly revenue successfully',
				data: {
					year: year,
					month: month,
					revenue: {
						vnd: totalRevenue,
						usd: totalRevenueUSD,
						orderCount: orderCount
					},
					dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date)),
					orders: orders.map(order => ({
						id: order.id,
						total_amount: parseFloat(order.total_amount),
						status: order.status,
						updated_at: order.updated_at ? new Date(order.updated_at).toISOString() : null
					}))
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Tổng hợp doanh thu tổng quan (tất cả thời gian)
let getTotalRevenue = () => {
	return new Promise(async (resolve, reject) => {
		try {
			// Tính tổng doanh thu từ tất cả orders đã completed
			const orders = await db.Order.findAll({
				where: {
					status: 'completed'
				},
				attributes: [
					'id',
					'total_amount',
					'status',
					'updated_at'
				],
				raw: false
			});

			// Lấy danh sách order IDs để query Payment
			const orderIds = orders.map(order => order.id);
			
			// Query Payment để lấy USD
			let totalRevenueUSD = 0;
			if (orderIds.length > 0) {
				const payments = await db.Payment.findAll({
					where: {
						orderId: {
							[Op.in]: orderIds
						}
					},
					attributes: ['orderId', 'totalAmountUSD']
				});
				
				payments.forEach(payment => {
					if (payment.totalAmountUSD) {
						totalRevenueUSD += parseFloat(payment.totalAmountUSD) || 0;
					}
				});
			}

			// Tính tổng doanh thu VNĐ
			let totalRevenue = 0;
			orders.forEach(order => {
				totalRevenue += parseFloat(order.total_amount) || 0;
			});

			resolve({
				errCode: 0,
				errMessage: 'Get total revenue successfully',
				data: {
					revenue: {
						vnd: totalRevenue,
						usd: totalRevenueUSD,
						orderCount: orders.length
					}
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	getDailyRevenue: getDailyRevenue,
	getMonthlyRevenue: getMonthlyRevenue,
	getTotalRevenue: getTotalRevenue
};
