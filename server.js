const express = require('express');
const cors = require('cors'); // <--- 1. Phải thêm dòng này
const { bootstrapApp } = require('./src/app');
const connectDB = require('./src/config/connectDB');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// --- PHẦN CẤU HÌNH ---

// 2. Cấu hình CORS (Phải đặt ĐẦU TIÊN, trước khi gọi API)
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true 
}));

// 3. Kết nối Database
connectDB(); 

// 4. Cấu hình Routes/App
// (Đặt ở đây để đảm bảo request nào cũng đã được "đóng dấu" CORS ở bước 2)
bootstrapApp(app); 

// ------------------------------

app.listen(port, () => {
    console.log(`Railway assigned port: ${process.env.PORT || 'Local 8080'}`);
    console.log(`Server is running on port: ${port}`);
});