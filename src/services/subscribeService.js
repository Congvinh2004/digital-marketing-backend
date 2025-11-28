const db = require('../database/models');

// MailChimp API integration (optional)
const addToMailChimp = async (email, fullName = null) => {
	try {
		const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
		const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
		const mailchimpServer = process.env.MAILCHIMP_SERVER; // e.g., 'us1', 'us2'

		// Nếu không có MailChimp config, bỏ qua
		if (!mailchimpApiKey || !mailchimpListId || !mailchimpServer) {
			console.log('MailChimp not configured. Skipping MailChimp integration.');
			return { success: false, message: 'MailChimp not configured' };
		}

		// MailChimp API endpoint
		const mailchimpUrl = `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`;

		// Prepare data for MailChimp
		const memberData = {
			email_address: email,
			status: 'subscribed', // 'subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional'
			merge_fields: {}
		};

		if (fullName) {
			const nameParts = fullName.split(' ');
			memberData.merge_fields.FNAME = nameParts[0] || '';
			memberData.merge_fields.LNAME = nameParts.slice(1).join(' ') || '';
		}

		// Call MailChimp API
		const response = await fetch(mailchimpUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${mailchimpApiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(memberData)
		});

		const result = await response.json();

		if (response.ok) {
			return {
				success: true,
				mailchimp_id: result.id,
				message: 'Added to MailChimp successfully'
			};
		} else {
			// Nếu email đã tồn tại trong MailChimp, vẫn coi là thành công
			if (result.title === 'Member Exists') {
				return {
					success: true,
					mailchimp_id: result.id || null,
					message: 'Email already exists in MailChimp'
				};
			}
			return {
				success: false,
				message: result.detail || 'Failed to add to MailChimp',
				error: result
			};
		}
	} catch (error) {
		console.error('MailChimp API error:', error);
		return {
			success: false,
			message: 'MailChimp API error',
			error: error.message
		};
	}
};

// Subscribe email
let subscribe = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { email, full_name } = bodyData;

			// Validation
			if (!email) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: email'
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

			// Kiểm tra email đã tồn tại chưa
			let subscriber = await db.Subscriber.findOne({
				where: { email: email.toLowerCase().trim() }
			});

			if (subscriber) {
				// Nếu đã unsubscribe, cho phép subscribe lại
				if (subscriber.status === 'unsubscribed') {
					subscriber.status = 'active';
					subscriber.full_name = full_name || subscriber.full_name;
					await subscriber.save();

					// Thêm lại vào MailChimp nếu có config
					let mailchimpResult = { success: false };
					if (process.env.MAILCHIMP_API_KEY) {
						mailchimpResult = await addToMailChimp(email, full_name);
						if (mailchimpResult.success && mailchimpResult.mailchimp_id) {
							subscriber.mailchimp_id = mailchimpResult.mailchimp_id;
							await subscriber.save();
						}
					}

					resolve({
						errCode: 0,
						errMessage: 'Resubscribed successfully',
						data: {
							id: subscriber.id,
							email: subscriber.email,
							full_name: subscriber.full_name,
							status: subscriber.status,
							mailchimp: mailchimpResult.success
						}
					});
					return;
				}

				// Nếu đã active, trả về thông báo
				resolve({
					errCode: 2,
					errMessage: 'Email already subscribed'
				});
				return;
			}

			// Tạo subscriber mới
			try {
				subscriber = await db.Subscriber.create({
					email: email.toLowerCase().trim(),
					full_name: full_name || null,
					status: 'active',
					source: 'website'
				});

				// Thêm vào MailChimp nếu có config
				let mailchimpResult = { success: false };
				if (process.env.MAILCHIMP_API_KEY) {
					mailchimpResult = await addToMailChimp(email, full_name);
					if (mailchimpResult.success && mailchimpResult.mailchimp_id) {
						subscriber.mailchimp_id = mailchimpResult.mailchimp_id;
						await subscriber.save();
					}
				}

				resolve({
					errCode: 0,
					errMessage: 'Subscribed successfully',
					data: {
						id: subscriber.id,
						email: subscriber.email,
						full_name: subscriber.full_name,
						status: subscriber.status,
						mailchimp: mailchimpResult.success
					}
				});
			} catch (error) {
				// Nếu bị duplicate (race condition)
				if (error.name === 'SequelizeUniqueConstraintError' || error.code === 'ER_DUP_ENTRY') {
					subscriber = await db.Subscriber.findOne({
						where: { email: email.toLowerCase().trim() }
					});

					if (subscriber) {
						resolve({
							errCode: 2,
							errMessage: 'Email already subscribed'
						});
					} else {
						reject(error);
					}
				} else {
					reject(error);
				}
			}
		} catch (e) {
			reject(e);
		}
	});
};

// Unsubscribe email
let unsubscribe = (bodyData) => {
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

			const subscriber = await db.Subscriber.findOne({
				where: { email: email.toLowerCase().trim() }
			});

			if (!subscriber) {
				resolve({
					errCode: 2,
					errMessage: 'Email not found'
				});
				return;
			}

			if (subscriber.status === 'unsubscribed') {
				resolve({
					errCode: 2,
					errMessage: 'Email already unsubscribed'
				});
				return;
			}

			// Update status
			subscriber.status = 'unsubscribed';
			await subscriber.save();

			// TODO: Có thể gọi MailChimp API để unsubscribe ở đó nữa

			resolve({
				errCode: 0,
				errMessage: 'Unsubscribed successfully',
				data: {
					id: subscriber.id,
					email: subscriber.email,
					status: subscriber.status
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Get all subscribers (for admin)
let getAllSubscribers = (queryParams) => {
	return new Promise(async (resolve, reject) => {
		try {
			const limit = parseInt(queryParams?.limit) || 50;
			const offset = parseInt(queryParams?.offset) || 0;
			const status = queryParams?.status;

			let whereClause = {};
			if (status) {
				whereClause.status = status;
			}

			const { count, rows: subscribers } = await db.Subscriber.findAndCountAll({
				where: whereClause,
				limit: limit,
				offset: offset,
				order: [['created_at', 'DESC']],
				raw: false
			});

			const totalPages = Math.ceil(count / limit);
			const currentPage = Math.floor(offset / limit) + 1;

			resolve({
				errCode: 0,
				errMessage: 'Get all subscribers successfully',
				data: subscribers,
				pagination: {
					total: count,
					limit: limit,
					offset: offset,
					currentPage: currentPage,
					totalPages: totalPages,
					hasNext: offset + limit < count,
					hasPrev: offset > 0
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	subscribe: subscribe,
	unsubscribe: unsubscribe,
	getAllSubscribers: getAllSubscribers
};

