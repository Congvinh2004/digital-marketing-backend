const express = require('express');
const { bootstrapApp } = require('./src/app');
const connectDB = require('./src/config/connectDB');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Bootstrap app (middlewares + routes)
bootstrapApp(app);

// Connect database
connectDB();

app.listen(PORT, () => {
	console.log(`Server is listening on port: ${PORT}`);
});
