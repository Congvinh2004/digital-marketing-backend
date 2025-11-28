const express = require('express');

const mainController = require('../controllers/mainController');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const addressRoutes = require('./addressRoutes');
const subscribeRoutes = require('./subscribeRoutes');
const revenueRoutes = require('./revenueRoutes');
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
	app.use('/api', categoryRoutes);
	app.use('/api', userRoutes);
	app.use('/api', orderRoutes);
	app.use('/api', addressRoutes);
	app.use('/api', subscribeRoutes);
	app.use('/api', revenueRoutes);
	// #endregion

	return app.use('/', router);
};

module.exports = initWebRoutes;

