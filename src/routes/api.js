const express = require('express');

const mainController = require('../controllers/mainController');
const productRoutes = require('./productRoutes');
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const addressRoutes = require('./addressRoutes');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const initWebRoutes = (app) => {
	// #region - 1xx - Main Routes
	/* 101 */ router.get('/', mainController.handleGetHome);
	/* 102 */ router.get('/health', mainController.handleGetHealth);
	/* 103 */ router.get('/db/ping', verifyToken, mainController.handlePingDatabase);
	// #endregion

	// #region - API Routes
	app.use('/api/auth', authRoutes);
	app.use('/api', productRoutes);
	app.use('/api', orderRoutes);
	app.use('/api', addressRoutes);
	// #endregion

	return app.use('/', router);
};

module.exports = initWebRoutes;

