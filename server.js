const express = require('express');
const { bootstrapApp } = require('./src/app');
const connectDB = require('./src/config/connectDB');

require('dotenv').config();

const app = express();
// Code chuẩn để lấy Port
const port = process.env.PORT || 8080;

// --- PHẦN BỔ SUNG QUAN TRỌNG ---

// 1. Gọi kết nối Database
connectDB(); 

// 2. Cấu hình Routes/App (truyền app vào hàm bootstrap)
bootstrapApp(app); 

// ------------------------------

app.listen(port, () => {
    // Log để kiểm tra (chỉ hiện khi chạy local hoặc in ra log Railway)
    console.log(`Railway assigned port: ${process.env.PORT || 'Local 8080'}`);
    console.log(`Server is running on port: ${port}`);
});