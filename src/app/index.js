const { registerMiddlewares } = require('./middlewares');
const initWebRoutes = require('../routes/api');

function bootstrapApp(app) {
	registerMiddlewares(app);
	initWebRoutes(app);
}

module.exports = { bootstrapApp };


