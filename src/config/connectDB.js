require('dotenv').config();

const db = require('../database/models');

async function connectDB() {
	try {
    await db.sequelize.authenticate();
		console.log('Database connection has been established successfully.');
		
		// Optional: sync models if needed
		// Uncomment dòng dưới để tự động cập nhật database theo models
		// await db.sequelize.sync({ alter: true, force: false });
		// console.log('Database schema updated, missing columns added.');
	} catch (error) {
		console.error('Unable to connect to the database:', error.message);
	}
}

module.exports = connectDB;


