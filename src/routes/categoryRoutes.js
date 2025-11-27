const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/auth');

// #region - 3xx - Category Routes
// Category CRUD Routes
router.get('/get-all-categories', categoryController.getAllCategories);
router.get('/get-category-by-id', categoryController.getCategoryById);
router.post('/create-category', verifyToken, categoryController.createCategory);
router.put('/update-category', verifyToken, categoryController.updateCategory);
router.delete('/delete-category', verifyToken, categoryController.deleteCategory);
// #endregion

module.exports = router;

