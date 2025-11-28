const subscribeService = require('../services/subscribeService');

let subscribe = async (req, res) => {
	try {
		const { email, full_name } = req.body;

		if (!email) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: email'
			});
		}

		let response = await subscribeService.subscribe({ email, full_name });
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
};

let unsubscribe = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: email'
			});
		}

		let response = await subscribeService.unsubscribe({ email });
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
};

let getAllSubscribers = async (req, res) => {
	try {
		let response = await subscribeService.getAllSubscribers(req.query);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
};

module.exports = {
	subscribe: subscribe,
	unsubscribe: unsubscribe,
	getAllSubscribers: getAllSubscribers
};

