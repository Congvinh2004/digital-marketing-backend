const jwt = require('jsonwebtoken');
const db = require('../database/models');

const verifyToken = async (req, res, next) => {
	try {
		// Lấy token từ header
		const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];

		if (!token) {
			return res.status(401).json({
				errCode: 1,
				errMessage: 'No token provided'
			});
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

		// Kiểm tra user có tồn tại không
		const user = await db.User.findOne({
			where: { id: decoded.id, status: 'active' },
			attributes: ['id', 'email', 'full_name', 'phone', 'role', 'status']
		});

		if (!user) {
			return res.status(401).json({
				errCode: 2,
				errMessage: 'User not found or inactive'
			});
		}

		// Gắn thông tin user vào request
		req.user = user;
		next();
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				errCode: 3,
				errMessage: 'Token expired'
			});
		}
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				errCode: 4,
				errMessage: 'Invalid token'
			});
		}
		return res.status(500).json({
			errCode: -1,
			errMessage: 'Error verifying token'
		});
	}
};

module.exports = verifyToken;

