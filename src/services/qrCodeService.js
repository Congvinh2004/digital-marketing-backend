// Service để tạo QR code
let QRCode;
try {
	QRCode = require('qrcode');
} catch (e) {
	console.warn('QRCode library not installed. Run: npm install qrcode');
	QRCode = null;
}

// Tạo QR code từ URL/Text
let generateQRCode = (text, options = {}) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!QRCode) {
				resolve({
					errCode: 1,
					errMessage: 'QRCode library not installed'
				});
				return;
			}

			if (!text) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: text'
				});
				return;
			}

			const defaultOptions = {
				width: options.width || 300,
				margin: options.margin || 2,
				color: {
					dark: options.darkColor || '#000000',
					light: options.lightColor || '#FFFFFF'
				},
				errorCorrectionLevel: options.errorCorrectionLevel || 'M'
			};

			// Tạo QR code dạng Data URL (base64)
			const qrCodeDataUrl = await QRCode.toDataURL(text, defaultOptions);

			// Tạo QR code dạng Buffer (để lưu file hoặc gửi binary)
			const qrCodeBuffer = await QRCode.toBuffer(text, defaultOptions);

			resolve({
				errCode: 0,
				errMessage: 'QR code generated successfully',
				data: {
					dataUrl: qrCodeDataUrl, // Base64 image: "data:image/png;base64,..."
					buffer: qrCodeBuffer, // Buffer để gửi binary
					text: text
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Tạo QR code từ PayPal approval URL
let generatePayPalQRCode = (approvalUrl, options = {}) => {
	return generateQRCode(approvalUrl, {
		width: options.width || 400,
		margin: options.margin || 3,
		...options
	});
};

module.exports = {
	generateQRCode: generateQRCode,
	generatePayPalQRCode: generatePayPalQRCode
};



