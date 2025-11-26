const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const verifyToken = require('../middleware/auth');

// #region - 2xx - Product Routes
	// Product Routes
	router.get('/get-all-products', productController.getAllProducts);
	router.get('/get-product-by-id', productController.getProductById);
	router.get('/get-products-by-category', productController.getProductByCategoryId);
	router.post('/create-product', productController.createProduct);
	router.put('/update-product', productController.updateProduct);
	router.delete('/delete-product', productController.deleteProduct);
	router.get('/get-all-categories', productController.getAllCategories);
	router.get('/get-product-by-category-id', productController.getProductByCategoryId);
// #endregion

module.exports = router;

