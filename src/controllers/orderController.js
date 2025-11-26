const orderService = require('../services/orderService');

let createOrder = async (req, res) => {
	try {
		// Lấy user từ token (đã được verifyToken middleware xác thực)
		const userId = req.user?.id;

		if (!userId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'User not authenticated'
			});
		}

		let response = await orderService.createOrder(req.body, userId);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let updatePayment = async (req, res) => {
	try {
		const orderId = req.params.orderId;

		if (!orderId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: orderId'
			});
		}

		let response = await orderService.updatePayment(orderId, req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

module.exports = {
	createOrder: createOrder,
	updatePayment: updatePayment
};



