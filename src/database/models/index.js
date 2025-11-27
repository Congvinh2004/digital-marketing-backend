const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

require('dotenv').config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Load config file
let configFile;
try {
	configFile = require('../../config/database.js');
} catch (error) {
	throw new Error(`Failed to load database config file: ${error.message}`);
}

// Get config for current environment
const config = configFile[env];

if (!config) {
	throw new Error(
		`Database configuration not found for environment: "${env}". ` +
		`Available environments: ${Object.keys(configFile).join(', ')}. ` +
		`Please check NODE_ENV environment variable or ensure config file has "${env}" key.`
	);
}

const db = {};

const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	{
		host: config.host,
		dialect: config.dialect || 'mysql',
		logging: config.logging ?? false,
		timezone: config.timezone || '+07:00',
		query: config.query,
	}
);

// Auto-load models placed in this directory (if any in the future)
fs.readdirSync(__dirname)
	.filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
	.forEach(file => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;


