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

let updateOrderStatus = async (req, res) => {
	try {
		const orderId = req.params.orderId;
		const { status } = req.body;

		if (!orderId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: orderId'
			});
		}

		if (!status) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: status'
			});
		}

		let response = await orderService.updateOrderStatus(orderId, status);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getAllOrders = async (req, res) => {
	try {
		let response = await orderService.getAllOrders(req.query);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getOrderById = async (req, res) => {
	try {
		const orderId = req.params.orderId;

		if (!orderId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: orderId'
			});
		}

		let response = await orderService.getOrderById(orderId);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let updatePaymentStatus = async (req, res) => {
	try {
		const orderId = req.params.orderId;
		const { payment_status } = req.body;

		if (!orderId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: orderId'
			});
		}

		if (!payment_status) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: payment_status'
			});
		}

		let response = await orderService.updatePaymentStatus(orderId, payment_status);
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
	updatePayment: updatePayment,
	updatePaymentStatus: updatePaymentStatus,
	updateOrderStatus: updateOrderStatus,
	getAllOrders: getAllOrders,
	getOrderById: getOrderById
};



