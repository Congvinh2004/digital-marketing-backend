// require('dotenv').config();

// module.exports = {
// 	development: {
// 		username: "root",
// 		password: "",
// 		database: "digital-maketing",
// 		host: "localhost",
// 		dialect: "mysql",
// 		logging: false,
// 		query: { raw: true },
// 		timezone: "+07:00"
// 	},
// 	test: {
// 		username: "root",
// 		password: "",
// 		database: "digital_marketing_test",
// 		host: "127.0.0.1",
// 		dialect: "mysql"
// 	},
// 	production: {
// 		username: process.env.DB_USER,
// 		password: process.env.DB_PASSWORD,
// 		database: process.env.DB_NAME,
// 		host: process.env.DB_HOST,
// 		port: process.env.DB_PORT || 3306,
// 		dialect: "mysql",
// 		logging: false,
// 		query: { raw: true },
// 		timezone: "+07:00",
// 		dialectOptions: {
// 			ssl: {
// 				require: true,
// 				rejectUnauthorized: false
// 			}
// 		}
// 	}
// };

require('dotenv').config();

module.exports = {
  // Cấu hình Development (Dùng được cho cả Local và Railway)
  development: {
    username: process.env.DB_USER || "root",      // Nếu không có biến DB_USER thì dùng "root"
    password: process.env.DB_PASSWORD || "",      // Nếu không có biến DB_PASSWORD thì dùng rỗng
    database: process.env.DB_NAME || "digital-maketing", // Tên DB dưới máy bạn
    host: process.env.DB_HOST || "127.0.0.1",     // <--- QUAN TRỌNG: Ưu tiên biến môi trường, không có mới dùng localhost
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    query: { raw: true },
    timezone: "+07:00"
  },
  
  // Cấu hình Production (Giữ nguyên cho chắc)
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