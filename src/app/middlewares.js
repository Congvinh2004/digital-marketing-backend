const cors = require('cors');
const express = require('express');

function registerMiddlewares(app) {
	// Tăng giới hạn body size để có thể nhận dữ liệu base64 lớn (50MB)
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ extended: true, limit: '50mb' }));
	app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
}

module.exports = { registerMiddlewares };


