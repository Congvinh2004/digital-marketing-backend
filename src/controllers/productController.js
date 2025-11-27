const productService = require('../services/productService');

let getAllProducts = async (req, res) => {
	try {
		let response = await productService.getAllProducts();
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getProductById = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let response = await productService.getProductById(req.query.id);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let createProduct = async (req, res) => {
	try {
		let arrParams = ['productName', 'price', 'category_id'];
		let missingParams = arrParams.filter(param => !req.body[param]);
		if (missingParams.length > 0) {
			return res.status(200).json({
				errCode: 1,
				errMessage: `Missing required parameter: ${missingParams.join(', ')}`
			});
		}
		let data = {
			productName: req.body.productName,
			price: req.body.price,
			description: req.body.description || '',
			quantity: req.body.quantity || 0,
			image: req.body.image || '',
			category_id: req.body.category_id,
			discount_percent: req.body.discount_percent !== undefined ? req.body.discount_percent : 0
		}
		let response = await productService.createProductService(data);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let updateProduct = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let data = {
			productName: req.body.productName,
			description: req.body.description || '',
			price: req.body.price,
			quantity: req.body.quantity || 0,
			category_id: req.body.category_id,
			image: req.body.image || '',
			discount_percent: req.body.discount_percent
		}
		let response = await productService.updateProductService(req.query.id, data);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let deleteProduct = async (req, res) => {
	try {
		if (!req.query.id) {
			return res.status(200).json({
				errCode: 1,
				errMessage: 'Missing required parameter: id'
			});
		}
		let response = await productService.deleteProductService(req.query.id);
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getAllCategories = async (req, res) => {
	try {
		let response = await productService.getAllCategoriesService();
		return res.status(200).json(response);
	} catch (e) {
		console.log(e);
		return res.status(200).json({
			errCode: -1,
			errMessage: 'Error from the server'
		});
	}
}

let getProductByCategoryId = async (req, res) => {
	try {
		let response = await productService.getProductByCategoryIdService(req.query);
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
	getAllProducts: getAllProducts,
	getProductById: getProductById,
	createProduct: createProduct,
	updateProduct: updateProduct,
	deleteProduct: deleteProduct,
	getAllCategories: getAllCategories,
	getProductByCategoryId: getProductByCategoryId
}

