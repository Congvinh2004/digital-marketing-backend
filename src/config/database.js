require('dotenv').config();

module.exports = {
	development: {
		username: "root",
		password: "",
		database: "digital-maketing",
		host: "localhost",
		dialect: "mysql",
		logging: false,
		query: { raw: true },
		timezone: "+07:00"
	},
	test: {
		username: "root",
		password: "",
		database: "digital_marketing_test",
		host: "127.0.0.1",
		dialect: "mysql"
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT || 3306,
		dialect: "mysql",
		logging: false,
		query: { raw: true },
		timezone: "+07:00",
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false
			}
		}
	}
};
