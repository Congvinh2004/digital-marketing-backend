const authService = require('../services/authService');

let register = async (req, res) => {
	try {
		let response = await authService.register(req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let verifyOTP = async (req, res) => {
	try {
		let response = await authService.verifyOTP(req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let login = async (req, res) => {
	try {
		let response = await authService.login(req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let resendOTP = async (req, res) => {
	try {
		let response = await authService.resendOTP(req.body);
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
	register: register,
	verifyOTP: verifyOTP,
	login: login,
	resendOTP: resendOTP
};



