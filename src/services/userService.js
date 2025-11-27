const db = require('../database/models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Get all users
let getAllUsers = (queryParams) => {
	return new Promise(async (resolve, reject) => {
		try {
			const limit = parseInt(queryParams?.limit) || 20;
			const offset = parseInt(queryParams?.offset) || 0;
			const role = queryParams?.role;
			const status = queryParams?.status;

			// Build where clause
			let whereClause = {};
			if (role) whereClause.role = role;
			if (status) whereClause.status = status;

			let { count, rows: users } = await db.User.findAndCountAll({
				where: whereClause,
				limit: limit,
				offset: offset,
				order: [['id', 'DESC']],
				attributes: ['id', 'email', 'full_name', 'phone', 'role', 'status', 'created_at', 'updated_at'],
				raw: false
			});

			// Calculate pagination info
			const totalPages = Math.ceil(count / limit);
			const currentPage = Math.floor(offset / limit) + 1;

			resolve({
				errCode: 0,
				errMessage: 'Get all users successfully',
				data: users,
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
}

// Get user by ID
let getUserById = (inputId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let user = await db.User.findOne({
					where: { id: inputId },
					attributes: ['id', 'email', 'full_name', 'phone', 'role', 'status', 'created_at', 'updated_at'],
					raw: false
				});

				if (!user) {
					resolve({
						errCode: 2,
						errMessage: 'User not found',
						data: {}
					});
				} else {
					resolve({
						errCode: 0,
						errMessage: 'Get user by id successfully',
						data: user
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

// Create user
let createUser = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Validation required parameters
			const requiredParams = ['email', 'password'];
			const missingParams = requiredParams.filter(param => !bodyData[param]);

			if (missingParams.length > 0) {
				resolve({
					errCode: 1,
					errMessage: `Missing required parameter: ${missingParams.join(', ')}`
				});
			} else {
				// Check if email already exists
				const existingUser = await db.User.findOne({
					where: { email: bodyData.email }
				});

				if (existingUser) {
					resolve({
						errCode: 2,
						errMessage: 'Email already exists'
					});
					return;
				}

				// Hash password
				const hashedPassword = await bcrypt.hash(bodyData.password, 10);

				// Create user
				let user = await db.User.create({
					email: bodyData.email,
					password: hashedPassword,
					full_name: bodyData.full_name || '',
					phone: bodyData.phone || '',
					role: bodyData.role || 'customer',
					status: bodyData.status || 'active'
				});

				// Remove password from response
				const userResponse = {
					id: user.id,
					email: user.email,
					full_name: user.full_name,
					phone: user.phone,
					role: user.role,
					status: user.status
				};

				resolve({
					errCode: 0,
					errMessage: 'Create user successfully',
					data: userResponse
				});
			}
		} catch (e) {
			reject(e);
		}
	});
}

// Update user
let updateUser = (inputId, inputData) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let user = await db.User.findOne({
					where: { id: inputId },
					raw: false
				});

				if (!user) {
					resolve({
						errCode: 2,
						errMessage: 'User not found'
					});
				} else {
					// Check if email is being changed and already exists
					if (inputData.email && inputData.email !== user.email) {
						const existingUser = await db.User.findOne({
							where: { 
								email: inputData.email,
								id: { [Op.ne]: inputId }
							}
						});

						if (existingUser) {
							resolve({
								errCode: 2,
								errMessage: 'Email already exists'
							});
							return;
						}
					}

					// Update fields
					if (inputData.email) user.email = inputData.email;
					if (inputData.password) {
						// Hash new password
						user.password = await bcrypt.hash(inputData.password, 10);
					}
					if (inputData.full_name !== undefined) user.full_name = inputData.full_name;
					if (inputData.phone !== undefined) user.phone = inputData.phone;
					if (inputData.role) user.role = inputData.role;
					if (inputData.status) user.status = inputData.status;

					await user.save();

					// Remove password from response
					const userResponse = {
						id: user.id,
						email: user.email,
						full_name: user.full_name,
						phone: user.phone,
						role: user.role,
						status: user.status
					};

					resolve({
						errCode: 0,
						errMessage: 'Update user successfully',
						data: userResponse
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

// Delete user
let deleteUser = (inputId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let user = await db.User.findOne({
					where: { id: inputId },
					raw: false
				});

				if (!user) {
					resolve({
						errCode: 2,
						errMessage: 'User not found'
					});
				} else {
					// Check if user has orders
					const orderCount = await db.Order.count({
						where: { user_id: inputId }
					});

					if (orderCount > 0) {
						// Instead of deleting, set status to inactive
						user.status = 'inactive';
						await user.save();

						resolve({
							errCode: 0,
							errMessage: `User has ${orderCount} order(s). Status changed to inactive instead of deletion`
						});
					} else {
						await user.destroy();

						resolve({
							errCode: 0,
							errMessage: 'Delete user successfully'
						});
					}
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = {
	getAllUsers: getAllUsers,
	getUserById: getUserById,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser
}

