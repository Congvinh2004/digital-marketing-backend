const db = require('../database/models');
const { Op } = require('sequelize');

// Tạo địa chỉ giao hàng
let createAddress = (bodyData, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const { full_name, phone, province, district, ward, detail, is_default } = bodyData;

			// Validation
			if (!full_name) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: full_name'
				});
				return;
			}

			if (!phone) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: phone'
				});
				return;
			}

			if (!province) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: province'
				});
				return;
			}

			if (!district) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: district'
				});
				return;
			}

			if (!ward) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: ward'
				});
				return;
			}

			if (!detail) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: detail'
				});
				return;
			}

			// Kiểm tra user có tồn tại không
			const user = await db.User.findOne({
				where: { id: userId, status: 'active' }
			});

			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'User not found or inactive'
				});
				return;
			}

			// Kiểm tra hoặc tạo customer từ user
			let customer = await db.Customer.findOne({
				where: { email: user.email }
			});

			if (!customer) {
				customer = await db.Customer.create({
					full_name: user.full_name || user.email,
					email: user.email,
					phone: user.phone,
					status: 'active'
				});
			}

			// Nếu set is_default = true, bỏ default của các address khác
			if (is_default === true) {
				await db.Address.update(
					{ is_default: false },
					{ where: { customer_id: customer.id } }
				);
			}

			// Tạo address
			const address = await db.Address.create({
				customer_id: customer.id,
				full_name: full_name,
				phone: phone,
				province: province,
				district: district,
				ward: ward,
				detail: detail,
				is_default: is_default || false
			});

			resolve({
				errCode: 0,
				errMessage: 'Address created successfully',
				data: address
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Lấy danh sách địa chỉ của user
let getAllAddresses = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Kiểm tra user có tồn tại không
			const user = await db.User.findOne({
				where: { id: userId, status: 'active' }
			});

			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'User not found or inactive'
				});
				return;
			}

			// Kiểm tra hoặc tạo customer từ user
			let customer = await db.Customer.findOne({
				where: { email: user.email }
			});

			if (!customer) {
				resolve({
					errCode: 0,
					errMessage: 'No addresses found',
					data: []
				});
				return;
			}

			// Lấy danh sách addresses
			const addresses = await db.Address.findAll({
				where: { customer_id: customer.id },
				order: [['is_default', 'DESC'], ['created_at', 'DESC']],
				raw: false
			});

			resolve({
				errCode: 0,
				errMessage: 'Get addresses successfully',
				data: addresses
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Lấy địa chỉ theo ID
let getAddressById = (addressId, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!addressId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: addressId'
				});
				return;
			}

			// Kiểm tra user có tồn tại không
			const user = await db.User.findOne({
				where: { id: userId, status: 'active' }
			});

			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'User not found or inactive'
				});
				return;
			}

			// Kiểm tra customer
			let customer = await db.Customer.findOne({
				where: { email: user.email }
			});

			if (!customer) {
				resolve({
					errCode: 3,
					errMessage: 'Customer not found'
				});
				return;
			}

			// Lấy address
			const address = await db.Address.findOne({
				where: { id: addressId, customer_id: customer.id },
				raw: false
			});

			if (!address) {
				resolve({
					errCode: 4,
					errMessage: 'Address not found'
				});
				return;
			}

			resolve({
				errCode: 0,
				errMessage: 'Get address successfully',
				data: address
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Cập nhật địa chỉ
let updateAddress = (addressId, bodyData, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!addressId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: addressId'
				});
				return;
			}

			const { full_name, phone, province, district, ward, detail, is_default } = bodyData;

			// Kiểm tra user có tồn tại không
			const user = await db.User.findOne({
				where: { id: userId, status: 'active' }
			});

			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'User not found or inactive'
				});
				return;
			}

			// Kiểm tra customer
			let customer = await db.Customer.findOne({
				where: { email: user.email }
			});

			if (!customer) {
				resolve({
					errCode: 3,
					errMessage: 'Customer not found'
				});
				return;
			}

			// Tìm address
			const address = await db.Address.findOne({
				where: { id: addressId, customer_id: customer.id },
				raw: false
			});

			if (!address) {
				resolve({
					errCode: 4,
					errMessage: 'Address not found'
				});
				return;
			}

			// Nếu set is_default = true, bỏ default của các address khác
			if (is_default === true && address.is_default === false) {
				await db.Address.update(
					{ is_default: false },
					{ where: { customer_id: customer.id, id: { [Op.ne]: addressId } } }
				);
			}

			// Cập nhật address
			if (full_name) address.full_name = full_name;
			if (phone) address.phone = phone;
			if (province) address.province = province;
			if (district) address.district = district;
			if (ward) address.ward = ward;
			if (detail) address.detail = detail;
			if (is_default !== undefined) address.is_default = is_default;

			await address.save();

			resolve({
				errCode: 0,
				errMessage: 'Address updated successfully',
				data: address
			});
		} catch (e) {
			reject(e);
		}
	});
};

// Xóa địa chỉ
let deleteAddress = (addressId, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!addressId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: addressId'
				});
				return;
			}

			// Kiểm tra user có tồn tại không
			const user = await db.User.findOne({
				where: { id: userId, status: 'active' }
			});

			if (!user) {
				resolve({
					errCode: 2,
					errMessage: 'User not found or inactive'
				});
				return;
			}

			// Kiểm tra customer
			let customer = await db.Customer.findOne({
				where: { email: user.email }
			});

			if (!customer) {
				resolve({
					errCode: 3,
					errMessage: 'Customer not found'
				});
				return;
			}

			// Tìm address
			const address = await db.Address.findOne({
				where: { id: addressId, customer_id: customer.id },
				raw: false
			});

			if (!address) {
				resolve({
					errCode: 4,
					errMessage: 'Address not found'
				});
				return;
			}

			// Xóa address
			await address.destroy();

			resolve({
				errCode: 0,
				errMessage: 'Address deleted successfully'
			});
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	createAddress: createAddress,
	getAllAddresses: getAllAddresses,
	getAddressById: getAddressById,
	updateAddress: updateAddress,
	deleteAddress: deleteAddress
};



