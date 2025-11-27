const express = require('express');

function registerMiddlewares(app) {
	// Tăng giới hạn body size để có thể nhận dữ liệu base64 lớn (50MB)
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ extended: true, limit: '50mb' }));
	// CORS đã được cấu hình trong server.js, không cần cấu hình lại ở đây
}

module.exports = { registerMiddlewares };


