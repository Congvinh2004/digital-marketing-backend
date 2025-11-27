const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

// #region - 4xx - User Routes
// User CRUD Routes
router.get('/get-all-users', verifyToken, userController.getAllUsers);
router.get('/get-user-by-id', verifyToken, userController.getUserById);
router.post('/create-user', verifyToken, userController.createUser);
router.put('/update-user', verifyToken, userController.updateUser);
router.delete('/delete-user', verifyToken, userController.deleteUser);
// #endregion

module.exports = router;

