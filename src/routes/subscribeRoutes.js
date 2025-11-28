const express = require('express');
const router = express.Router();

const subscribeController = require('../controllers/subscribeController');
const verifyToken = require('../middleware/auth');

// #region - 5xx - Subscribe Routes
// Subscribe Routes (public - không cần auth)
router.post('/subscribe', subscribeController.subscribe);
router.post('/unsubscribe', subscribeController.unsubscribe);

// Admin routes (cần auth)
router.get('/get-all-subscribers', verifyToken, subscribeController.getAllSubscribers);
// #endregion

module.exports = router;

