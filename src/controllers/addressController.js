const addressService = require('../services/addressService');

let createAddress = async (req, res) => {
	try {
		// Lấy user từ token (đã được verifyToken middleware xác thực)
		const userId = req.user?.id;

		if (!userId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'User not authenticated'
			});
		}

		let response = await addressService.createAddress(req.body, userId);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getAllAddresses = async (req, res) => {
	try {
		// Lấy user từ token
		const userId = req.user?.id;

		if (!userId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'User not authenticated'
			});
		}

		let response = await addressService.getAllAddresses(userId);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getAddressById = async (req, res) => {
	try {
		// Lấy user từ token
		const userId = req.user?.id;

		if (!userId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'User not authenticated'
			});
		}

		const addressId = req.params.addressId || req.query.addressId;

		if (!addressId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: addressId'
			});
		}

		let response = await addressService.getAddressById(addressId, userId);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let updateAddress = async (req, res) => {
	try {
		// Lấy user từ token
		const userId = req.user?.id;

		if (!userId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'User not authenticated'
			});
		}

		const addressId = req.params.addressId;

		if (!addressId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: addressId'
			});
		}

		let response = await addressService.updateAddress(addressId, req.body, userId);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let deleteAddress = async (req, res) => {
	try {
		// Lấy user từ token
		const userId = req.user?.id;

		if (!userId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'User not authenticated'
			});
		}

		const addressId = req.params.addressId;

		if (!addressId) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: addressId'
			});
		}

		let response = await addressService.deleteAddress(addressId, userId);
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
	createAddress: createAddress,
	getAllAddresses: getAllAddresses,
	getAddressById: getAddressById,
	updateAddress: updateAddress,
	deleteAddress: deleteAddress
};



