const mainService = require('../services/mainService');

class MainController {
	// GET /
	async handleGetHome(req, res) {
		try {
			const result = await mainService.getHomeInfo();
			res.json(result);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	// GET /health
	async handleGetHealth(req, res) {
		try {
			const result = await mainService.getHealthStatus();
			res.json(result);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	// GET /db/ping
	async handlePingDatabase(req, res) {
		try {
			const result = await mainService.pingDatabase();
			res.json(result);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = new MainController();

