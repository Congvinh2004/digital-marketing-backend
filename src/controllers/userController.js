const userService = require('../services/userService');

let getAllUsers = async (req, res) => {
	try {
		let response = await userService.getAllUsers(req.query);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getUserById = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let response = await userService.getUserById(req.query.id);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let createUser = async (req, res) => {
	try {
		let arrParams = ['email', 'password'];
		let missingParams = arrParams.filter(param => !req.body[param]);
		if (missingParams.length > 0) {
			return res.status(200).json({
				errCode: 1,
				errMessage: `Missing required parameter: ${missingParams.join(', ')}`
			});
		}
		let data = {
			email: req.body.email,
			password: req.body.password,
			full_name: req.body.full_name || '',
			phone: req.body.phone || '',
			role: req.body.role || 'customer',
			status: req.body.status || 'active'
		}
		let response = await userService.createUser(data);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let updateUser = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let data = {
			email: req.body.email,
			password: req.body.password,
			full_name: req.body.full_name,
			phone: req.body.phone,
			role: req.body.role,
			status: req.body.status
		}
		let response = await userService.updateUser(req.query.id, data);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let deleteUser = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let response = await userService.deleteUser(req.query.id);
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
	getAllUsers: getAllUsers,
	getUserById: getUserById,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser
}

