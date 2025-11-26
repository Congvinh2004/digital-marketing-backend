const { sequelize } = require('../config/database');

class MainService {
	// Get home information
	async getHomeInfo() {
		return {
			status: 'ok',
			service: 'digital-marketing-v14'
		};
	}

	// Get health status
	async getHealthStatus() {
		return {
			status: 'healthy'
		};
	}

	// Ping database to check connection
	async pingDatabase() {
		try {
			await sequelize.authenticate();
			const [results] = await sequelize.query('SELECT 1 as ok');
			return {
				db: 'ok',
				result: results
			};
		} catch (error) {
			throw new Error(`Database connection failed: ${error.message}`);
		}
	}
}

module.exports = new MainService();

