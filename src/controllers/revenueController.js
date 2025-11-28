const revenueService = require('../services/revenueService');

let getDailyRevenue = async (req, res) => {
	try {
		let response = await revenueService.getDailyRevenue(req.query);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
};

let getMonthlyRevenue = async (req, res) => {
	try {
		let response = await revenueService.getMonthlyRevenue(req.query);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
};

let getTotalRevenue = async (req, res) => {
	try {
		let response = await revenueService.getTotalRevenue();
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
	getDailyRevenue: getDailyRevenue,
	getMonthlyRevenue: getMonthlyRevenue,
	getTotalRevenue: getTotalRevenue
};
