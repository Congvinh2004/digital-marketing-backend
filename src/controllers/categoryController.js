const categoryService = require('../services/categoryService');

let getAllCategories = async (req, res) => {
	try {
		let response = await categoryService.getAllCategories();
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getCategoryById = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let response = await categoryService.getCategoryById(req.query.id);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let createCategory = async (req, res) => {
	try {
		let arrParams = ['name'];
		let missingParams = arrParams.filter(param => !req.body[param]);
		if (missingParams.length > 0) {
			return res.status(200).json({
				errCode: 1,
				errMessage: `Missing required parameter: ${missingParams.join(', ')}`
			});
		}
		let data = {
			name: req.body.name,
			slug: req.body.slug,
			description: req.body.description || '',
			status: req.body.status || 'active'
		}
		let response = await categoryService.createCategory(data);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let updateCategory = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let data = {
			name: req.body.name,
			slug: req.body.slug,
			description: req.body.description,
			status: req.body.status
		}
		let response = await categoryService.updateCategory(req.query.id, data);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let deleteCategory = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let response = await categoryService.deleteCategory(req.query.id);
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
	getAllCategories: getAllCategories,
	getCategoryById: getCategoryById,
	createCategory: createCategory,
	updateCategory: updateCategory,
	deleteCategory: deleteCategory
}

