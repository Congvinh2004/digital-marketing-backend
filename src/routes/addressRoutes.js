const express = require('express');
const router = express.Router();

const addressController = require('../controllers/addressController');
const verifyToken = require('../middleware/auth');

// #region - Address Routes
router.post('/addresses/create', verifyToken, addressController.createAddress);
router.get('/addresses', verifyToken, addressController.getAllAddresses);
router.get('/addresses/:addressId', verifyToken, addressController.getAddressById);
router.put('/addresses/:addressId', verifyToken, addressController.updateAddress);
router.delete('/addresses/:addressId', verifyToken, addressController.deleteAddress);
// #endregion

module.exports = router;



