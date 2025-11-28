const db = require('../database/models');
const { Op } = require('sequelize');

let getAllProducts = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let products = await db.Product.findAll({
				order: [['id', 'DESC']],
				include: [
					{ model: db.Category, as: 'categoryInfo', attributes: ['id', 'name', 'slug'] }
				],
				raw: false,
				nest: true
			});

			resolve({
				errCode: 0,
				errMessage: 'Get all products successfully',
				data: products
			});
		} catch (e) {
			reject(e);
		}
	});
}

let getProductById = (inputId) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Validation và parse từ query params

			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let product = await db.Product.findOne({
					where: { id: inputId },
					include: [
						{ model: db.Category, as: 'categoryInfo', attributes: ['id', 'name', 'slug'] }
					],
					raw: false,
					nest: true
				});

				if (!product) {
					resolve({
						errCode: 2,
						errMessage: 'Product not found',
						data: {}
					});
				} else {
					resolve({
						errCode: 0,
						errMessage: 'Get product by id successfully',
						data: product
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

let createProductService = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Validation required parameters
			const requiredParams = ['productName', 'price', 'category_id'];
			const missingParams = requiredParams.filter(param => !bodyData[param]);

			if (missingParams.length > 0) {
				resolve({
					errCode: 1,
					errMessage: `Missing required parameter: ${missingParams.join(', ')}`
				});
			} else {
				// Parse và chuẩn hóa data
				const productData = {
					productName: bodyData.productName,
					price: parseFloat(bodyData.price),
					description: bodyData.description || '',
					quantity: parseInt(bodyData.quantity) || 0,
					category_id: parseInt(bodyData.category_id),
					image: bodyData.image || '',
					discount_percent: bodyData.discount_percent !== undefined ? parseFloat(bodyData.discount_percent) : 0
				};

				// Validate price
				if (isNaN(productData.price) || productData.price < 0) {
					resolve({
						errCode: 1,
						errMessage: 'Invalid price value'
					});
					return;
				}

				// Validate discount_percent
				if (isNaN(productData.discount_percent) || productData.discount_percent < 0 || productData.discount_percent > 100) {
					resolve({
						errCode: 1,
						errMessage: 'Invalid discount_percent value. Must be between 0 and 100'
					});
					return;
				}

				// Validate category_id
				if (isNaN(productData.category_id)) {
					resolve({
						errCode: 1,
						errMessage: 'Invalid category_id value'
					});
					return;
				}

				// Kiểm tra category có tồn tại không
				let category = await db.Category.findOne({
					where: { id: productData.category_id },
					attributes: ['id', 'name']
				});

				if (!category) {
					resolve({
						errCode: 2,
						errMessage: 'Category not found'
					});
					return;
				}

				// Tạo product
				let product = await db.Product.create({
					productName: productData.productName,
					description: productData.description,
					price: productData.price,
					quantity: productData.quantity,
					category_id: productData.category_id,
					category: category.name,
					image: productData.image,
					discount_percent: productData.discount_percent
				});

				resolve({
					errCode: 0,
					errMessage: 'Create product successfully',
					data: product
				});
			}
		} catch (e) {
			reject(e);
		}
	});
}	


let updateProductService = (inputId, inputData) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let product = await db.Product.findOne({
					where: { id: inputId },
					raw: false
				});

				if (!product) {
					resolve({
						errCode: 2,
						errMessage: 'Product not found'
					});
				} else {
					// Validate discount_percent if provided
					if (inputData.discount_percent !== undefined) {
						const discountPercent = parseFloat(inputData.discount_percent);
						if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
							resolve({
								errCode: 1,
								errMessage: 'Invalid discount_percent value. Must be between 0 and 100'
							});
							return;
						}
					}

					// Update fields
					if (inputData.productName) product.productName = inputData.productName;
					if (inputData.description !== undefined) product.description = inputData.description;
					if (inputData.price) product.price = inputData.price;
					if (inputData.quantity !== undefined) product.quantity = inputData.quantity;
					if (inputData.category) product.category = inputData.category;
					if (inputData.category_id) product.category_id = inputData.category_id;
					if (inputData.image) product.image = inputData.image;
					if (inputData.discount_percent !== undefined) product.discount_percent = parseFloat(inputData.discount_percent);

					await product.save();

					resolve({
						errCode: 0,
						errMessage: 'Update product successfully',
						data: product
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

let deleteProductService = (inputId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let product = await db.Product.findOne({
					where: { id: inputId },
					raw: false
				});

				if (!product) {
					resolve({
						errCode: 2,
						errMessage: 'Product not found'
					});
				} else {
					// Kiểm tra xem sản phẩm có trong đơn hàng nào không
					const orderItemCount = await db.OrderItem.count({
						where: { product_id: inputId }
					});

					if (orderItemCount > 0) {
						resolve({
							errCode: 3,
							errMessage: `Cannot delete product. This product is in ${orderItemCount} order item(s). Please remove it from orders first or set status to inactive.`
						});
					} else {
						await product.destroy();

						resolve({
							errCode: 0,
							errMessage: 'Delete product successfully'
						});
					}
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

let getAllCategoriesService = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let categories = await db.Category.findAll({
				where: { status: 'active' },
				order: [['id', 'ASC']],
				raw: false
			});

			resolve({
				errCode: 0,
				errMessage: 'Get all categories successfully',
				data: categories
			});
		} catch (e) {
			reject(e);
		}
	});
}

let getProductByCategoryIdService = (queryParams) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Parse và validate từ query params
			const categoryId = queryParams?.category_id;
			const limit = parseInt(queryParams?.limit) || 20;
			const offset = parseInt(queryParams?.offset) || 0;
			const sortBy = queryParams?.sortBy || 'id';
			const sortOrder = queryParams?.sortOrder || 'DESC';
			const minPrice = queryParams?.minPrice ? parseFloat(queryParams.minPrice) : null;
			const maxPrice = queryParams?.maxPrice ? parseFloat(queryParams.maxPrice) : null;

			if (!categoryId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: category_id'
				});
			} else {
				// Kiểm tra category có tồn tại không
				let category = await db.Category.findOne({
					where: { id: categoryId, status: 'active' },
					attributes: ['id', 'name', 'slug', 'description']
				});

				if (!category) {
					resolve({
						errCode: 2,
						errMessage: 'Category not found or inactive',
						data: []
					});
				} else {

					// Build where clause
					let whereClause = {
						category_id: categoryId
					};

					// Filter theo giá nếu có
					if (minPrice !== null || maxPrice !== null) {
						whereClause.price = {};
						if (minPrice !== null) whereClause.price[Op.gte] = minPrice;
						if (maxPrice !== null) whereClause.price[Op.lte] = maxPrice;
					}

					// Query với pagination và sorting
					let { count, rows: products } = await db.Product.findAndCountAll({
						where: whereClause,
						limit: limit,
						offset: offset,
						order: [[sortBy, sortOrder]],
						attributes: [
							'id',
							'productName',
							'description',
							'price',
							'quantity',
							'sold_quantity',
							'image',
							'discount_percent',
							'category_id',
							'createdAt',
							'updatedAt'
						],
						include: [
							{
								model: db.Category,
								as: 'categoryInfo',
								attributes: ['id', 'name', 'slug']
							}
						],
						raw: false,
						nest: true
					});

					// Tính toán pagination info
					const totalPages = Math.ceil(count / limit);
					const currentPage = Math.floor(offset / limit) + 1;

					resolve({
						errCode: 0,
						errMessage: 'Get products by category successfully',
						data: products,
						pagination: {
							total: count,
							limit: limit,
							offset: offset,
							currentPage: currentPage,
							totalPages: totalPages,
							hasNext: offset + limit < count,
							hasPrev: offset > 0
						},
						category: category
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = {
	getAllProducts: getAllProducts,
	getProductById: getProductById,
	createProductService: createProductService,
	updateProductService: updateProductService,
	deleteProductService: deleteProductService,
	getAllCategoriesService: getAllCategoriesService,
	getProductByCategoryIdService: getProductByCategoryIdService
}

