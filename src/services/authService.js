const db = require('../database/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Cấu hình email (sử dụng Gmail)
const createTransporter = () => {
	return nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER || 'vinhfc77@gmail.com',
			pass: process.env.EMAIL_PASSWORD
		}
	});
};

// Tạo mã OTP 6 số
const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Gửi email OTP
const sendOTPEmail = async (email, otpCode) => {
	try {
		const transporter = createTransporter();
		const mailOptions = {
			from: process.env.EMAIL_USER || 'your-email@gmail.com',
			to: email,
			subject: 'Mã OTP xác thực đăng ký',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Xác thực đăng ký tài khoản</h2>
					<p>Xin chào,</p>
					<p>Mã OTP của bạn là:</p>
					<div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
						${otpCode}
					</div>
					<p>Mã OTP này có hiệu lực trong <strong>10 phút</strong>.</p>
					<p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
					<p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
				</div>
			`
		};

		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending email:', error);
		return false;
	}
};

// Đăng ký - Gửi OTP
let register = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { email, password, full_name, phone } = bodyData;

			// Validation
			if (!email || !password) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: email and password'
				});
				return;
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				resolve({
					errCode: 1,
					errMessage: 'Invalid email format'
				});
				return;
			}

			// Validate password (ít nhất 6 ký tự)
			if (password.length < 6) {
				resolve({
					errCode: 1,
					errMessage: 'Password must be at least 6 characters'
				});
				return;
			}

			// Kiểm tra email đã tồn tại chưa
			const existingUser = await db.User.findOne({
				where: { email: email }
			});

			if (existingUser) {
				resolve({
					errCode: 2,
					errMessage: 'Email already exists'
				});
				return;
			}

			// Tạo mã OTP
			const otpCode = generateOTP();
			const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

			// Xóa OTP cũ của email này (nếu có)
			await db.Otp.destroy({
				where: {
					email: email,
					is_used: false
				}
			});

			// Lưu OTP vào database
			await db.Otp.create({
				email: email,
				otp_code: otpCode,
				expires_at: expiresAt,
				is_used: false
			});

			// Gửi email OTP
			const emailSent = await sendOTPEmail(email, otpCode);

			if (!emailSent) {
				resolve({
					errCode: 3,
					errMessage: 'Failed to send OTP email'
				});
				return;
			}

			// Lưu thông tin đăng ký tạm thời (có thể lưu vào session hoặc database tạm)
			// Ở đây ta sẽ lưu vào một bảng tạm hoặc chỉ lưu khi verify OTP thành công

			resolve({
				errCode: 0,
				errMessage: 'OTP sent to email successfully',
				data: {
					email: email,
					expires_at: expiresAt
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Xác minh OTP và hoàn tất đăng ký
let verifyOTP = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { email, otp_code, password, full_name, phone } = bodyData;

			// Validation
			if (!email || !otp_code || !password) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: email, otp_code, and password'
				});
				return;
			}

			// Tìm OTP
			const otpRecord = await db.Otp.findOne({
				where: {
					email: email,
					otp_code: otp_code,
					is_used: false
				},
				raw: false
			});

			if (!otpRecord) {
				resolve({
					errCode: 2,
					errMessage: 'Invalid or expired OTP'
				});
				return;
			}

			// Kiểm tra OTP đã hết hạn chưa
			if (new Date() > new Date(otpRecord.expires_at)) {
				resolve({
					errCode: 2,
					errMessage: 'OTP has expired'
				});
				return;
			}

			// Kiểm tra email đã tồn tại chưa (phòng trường hợp đăng ký lại)
			const existingUser = await db.User.findOne({
				where: { email: email }
			});

			if (existingUser) {
				resolve({
					errCode: 3,
					errMessage: 'Email already registered'
				});
				return;
			}

			// Hash password
			const saltRounds = 10;
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			// Tạo user mới
			const newUser = await db.User.create({
				email: email,
				password: hashedPassword,
				full_name: full_name || null,
				phone: phone || null,
				role: 'customer',
				status: 'active'
			});

			// Đánh dấu OTP đã sử dụng
			otpRecord.is_used = true;
			await otpRecord.save();

			// Tạo token
			const token = jwt.sign(
				{ id: newUser.id, email: newUser.email, role: newUser.role },
				process.env.JWT_SECRET || 'your-secret-key',
				{ expiresIn: '7d' }
			);

			resolve({
				errCode: 0,
				errMessage: 'Registration successful',
				data: {
					user: {
						id: newUser.id,
						email: newUser.email,
						full_name: newUser.full_name,
						phone: newUser.phone,
						role: newUser.role
					},
					token: token
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Đăng nhập
let login = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { email, password } = bodyData;

			// Validation
			if (!email || !password) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: email and password'
				});
				return;
			}

			// Tìm user
			const user = await db.User.findOne({
				where: { email: email }
			});

			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'Invalid email or password'
				});
				return;
			}

			// Kiểm tra status
			if (user.status !== 'active') {
				resolve({
					errCode: 3,
					errMessage: 'Account is inactive'
				});
				return;
			}

			// Verify password
			const isPasswordValid = await bcrypt.compare(password, user.password);

			if (!isPasswordValid) {
				resolve({
					errCode: 2,
					errMessage: 'Invalid email or password'
				});
				return;
			}

			// Tạo token
			const token = jwt.sign(
				{ id: user.id, email: user.email, role: user.role },
				process.env.JWT_SECRET || 'your-secret-key',
				{ expiresIn: '7d' }
			);

			resolve({
				errCode: 0,
				errMessage: 'Login successful',
				data: {
					user: {
						id: user.id,
						email: user.email,
						full_name: user.full_name,
						phone: user.phone,
						role: user.role
					},
					token: token
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Gửi lại OTP
let resendOTP = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { email } = bodyData;

			if (!email) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: email'
				});
				return;
			}

			// Kiểm tra email đã đăng ký chưa
			const existingUser = await db.User.findOne({
				where: { email: email }
			});

			if (existingUser) {
				resolve({
					errCode: 2,
					errMessage: 'Email already registered'
				});
				return;
			}

			// Tạo mã OTP mới
			const otpCode = generateOTP();
			const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

			// Xóa OTP cũ
			await db.Otp.destroy({
				where: {
					email: email,
					is_used: false
				}
			});

			// Lưu OTP mới
			await db.Otp.create({
				email: email,
				otp_code: otpCode,
				expires_at: expiresAt,
				is_used: false
			});

			// Gửi email
			const emailSent = await sendOTPEmail(email, otpCode);

			if (!emailSent) {
				resolve({
					errCode: 3,
					errMessage: 'Failed to send OTP email'
				});
				return;
			}

			resolve({
				errCode: 0,
				errMessage: 'OTP resent successfully',
				data: {
					email: email,
					expires_at: expiresAt
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	register: register,
	verifyOTP: verifyOTP,
	login: login,
	resendOTP: resendOTP
};



