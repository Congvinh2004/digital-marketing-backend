const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const paypalController = require('../controllers/paypalController');
const verifyToken = require('../middleware/auth');

// #region - Order Routes
router.post('/orders/create', verifyToken, orderController.createOrder);
router.put('/orders/:orderId/payment', orderController.updatePayment);
// #endregion

// #region - PayPal Routes
router.post('/paypal/create-order', verifyToken, paypalController.createPayPalOrder);
router.post('/paypal/capture-order', verifyToken, paypalController.capturePayPalOrder);
router.post('/paypal/qr-code', verifyToken, paypalController.generatePayPalQRCode);
router.post('/paypal/qr-code-by-order', verifyToken, paypalController.generateQRCodeByOrderId);
// #endregion

module.exports = router;

