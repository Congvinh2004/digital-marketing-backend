// Kiểm tra PayPal SDK đã được cài đặt chưa
let paypal;
try {
	paypal = require('@paypal/checkout-server-sdk');
} catch (e) {
	console.warn('PayPal SDK not installed. Run: npm install @paypal/checkout-server-sdk');
	paypal = null;
}

// Kiểm tra QR Code library
let QRCode;
try {
	QRCode = require('qrcode');
} catch (e) {
	console.warn('QRCode library not installed. Run: npm install qrcode');
	QRCode = null;
}

// Cấu hình PayPal client
const environment = () => {
	if (!paypal) {
		throw new Error('PayPal SDK not installed');
	}

	const clientId = process.env.PAYPAL_CLIENT_ID;
	const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

	// Kiểm tra credentials đã được cấu hình chưa
	if (!clientId || !clientSecret || 
		clientId === 'your-sandbox-client-id' || 
		clientId === 'your-live-client-id' ||
		clientSecret === 'your-sandbox-secret' || 
		clientSecret === 'your-live-secret') {
		throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file. See HUONG_DAN_PAYPAL.md for instructions.');
	}

	if (process.env.NODE_ENV === 'production') {
		return new paypal.core.LiveEnvironment(clientId, clientSecret);
	} else {
		return new paypal.core.SandboxEnvironment(clientId, clientSecret);
	}
};

const client = () => {
	if (!paypal) {
		throw new Error('PayPal SDK not installed');
	}
	return new paypal.core.PayPalHttpClient(environment());
};

// Tạo PayPal order
let createPayPalOrder = (orderData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { total_amount, currency = 'USD', items } = orderData;

			if (!total_amount) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: total_amount'
				});
				return;
			}

			const request = new paypal.orders.OrdersCreateRequest();
			request.prefer('return=representation');
			request.requestBody({
				intent: 'CAPTURE',
				purchase_units: [{
					amount: {
						currency_code: currency,
						value: total_amount.toFixed(2),
						breakdown: {
							item_total: {
								currency_code: currency,
								value: total_amount.toFixed(2)
							}
						}
					},
					items: items ? items.map(item => ({
						name: item.name,
						unit_amount: {
							currency_code: currency,
							value: item.price.toFixed(2)
						},
						quantity: item.quantity.toString()
					})) : []
				}],
				application_context: {
					brand_name: 'Digital Marketing Store',
					landing_page: 'NO_PREFERENCE',
					user_action: 'PAY_NOW',
					return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/payment/success',
					cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/payment/cancel'
				}
			});

			const order = await client().execute(request);

			// Tìm approval URL từ links
			const approvalUrl = order.result.links.find(link => link.rel === 'approve')?.href;

			// Tạo QR code từ approval URL
			let qrCodeDataUrl = null;
			if (approvalUrl && QRCode) {
				try {
					qrCodeDataUrl = await QRCode.toDataURL(approvalUrl, {
						width: 300,
						margin: 2,
						color: {
							dark: '#000000',
							light: '#FFFFFF'
						}
					});
				} catch (qrError) {
					console.error('Error generating QR code:', qrError);
				}
			}

			resolve({
				errCode: 0,
				errMessage: 'PayPal order created successfully',
				data: {
					orderId: order.result.id,
					status: order.result.status,
					approvalUrl: approvalUrl,
					qrCode: qrCodeDataUrl, // Base64 image data URL
					links: order.result.links
				}
			});
		} catch (e) {
			console.error('PayPal create order error:', e);
			
			// Kiểm tra lỗi credentials
			if (e.message && e.message.includes('PayPal credentials not configured')) {
				resolve({
					errCode: 1,
					errMessage: e.message,
					data: {
						hint: 'Please configure PayPal credentials in .env file. See HUONG_DAN_PAYPAL.md for instructions.'
					}
				});
				return;
			}
			
			if (e.statusCode === 401) {
				resolve({
					errCode: 1,
					errMessage: 'PayPal authentication failed. Please check your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file.',
					data: {
						error: 'invalid_client',
						hint: 'Make sure you are using valid Sandbox credentials from https://developer.paypal.com/'
					}
				});
				return;
			}
			
			if (e.statusCode) {
				resolve({
					errCode: 1,
					errMessage: `PayPal API error: ${e.message || 'Failed to create PayPal order'}`,
					data: e
				});
			} else {
				reject(e);
			}
		}
	});
};

// Capture PayPal payment
let capturePayPalOrder = (orderId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!orderId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: orderId'
				});
				return;
			}

			const request = new paypal.orders.OrdersCaptureRequest(orderId);
			request.requestBody({});

			const capture = await client().execute(request);

			// Lấy transaction ID từ capture
			const transactionId = capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
			const captureStatus = capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.status || null;

			resolve({
				errCode: 0,
				errMessage: 'PayPal payment captured successfully',
				data: {
					orderId: capture.result.id,
					status: capture.result.status,
					transactionId: transactionId,
					captureStatus: captureStatus,
					payer: capture.result.payer,
					purchase_units: capture.result.purchase_units
				}
			});
		} catch (e) {
			console.error('PayPal capture error:', e);
			
			// Kiểm tra lỗi credentials
			if (e.message && e.message.includes('PayPal credentials not configured')) {
				resolve({
					errCode: 1,
					errMessage: e.message,
					data: {
						hint: 'Please configure PayPal credentials in .env file. See HUONG_DAN_PAYPAL.md for instructions.'
					}
				});
				return;
			}
			
			if (e.statusCode === 401) {
				resolve({
					errCode: 1,
					errMessage: 'PayPal authentication failed. Please check your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file.',
					data: {
						error: 'invalid_client',
						hint: 'Make sure you are using valid Sandbox credentials from https://developer.paypal.com/'
					}
				});
				return;
			}
			
			if (e.statusCode) {
				resolve({
					errCode: 1,
					errMessage: `PayPal API error: ${e.message || 'Failed to capture PayPal payment'}`,
					data: e
				});
			} else {
				reject(e);
			}
		}
	});
};

module.exports = {
	createPayPalOrder: createPayPalOrder,
	capturePayPalOrder: capturePayPalOrder
};

