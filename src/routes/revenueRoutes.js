const express = require('express');
const router = express.Router();

const revenueController = require('../controllers/revenueController');
const verifyToken = require('../middleware/auth');

// #region - 6xx - Revenue Routes
// Revenue Routes (cần auth - chỉ admin)
router.get('/revenue/daily', verifyToken, revenueController.getDailyRevenue);
router.get('/revenue/monthly', verifyToken, revenueController.getMonthlyRevenue);
router.get('/revenue/total', verifyToken, revenueController.getTotalRevenue);
// #endregion

module.exports = router;
