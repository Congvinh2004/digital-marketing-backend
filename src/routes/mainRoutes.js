const express = require('express');
const router = express.Router();

const mainController = require('../controllers/mainController');
const verifyToken = require('../middleware/auth');

// #region - 1xx - Main Routes
/* 101 */ router.get('/', mainController.handleGetHome);
/* 102 */ router.get('/health', mainController.handleGetHealth);
/* 103 */ router.get('/db/ping', verifyToken, mainController.handlePingDatabase);
// #endregion

module.exports = router;
