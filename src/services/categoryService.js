const db = require('../database/models');
const { Op } = require('sequelize');

// Get all categories
let getAllCategories = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let categories = await db.Category.findAll({
				order: [['id', 'DESC']],
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

// Get category by ID
let getCategoryById = (inputId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let category = await db.Category.findOne({
					where: { id: inputId },
					include: [
						{ 
							model: db.Product, 
							as: 'products', 
							attributes: ['id', 'productName', 'price', 'quantity', 'image'],
							required: false
						}
					],
					raw: false,
					nest: true
				});

				if (!category) {
					resolve({
						errCode: 2,
						errMessage: 'Category not found',
						data: {}
					});
				} else {
					resolve({
						errCode: 0,
						errMessage: 'Get category by id successfully',
						data: category
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

// Create category
let createCategory = (bodyData) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Validation required parameters
			const requiredParams = ['name'];
			const missingParams = requiredParams.filter(param => !bodyData[param]);

			if (missingParams.length > 0) {
				resolve({
					errCode: 1,
					errMessage: `Missing required parameter: ${missingParams.join(', ')}`
				});
			} else {
				// Generate slug from name if not provided
				let slug = bodyData.slug || bodyData.name.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/(^-|-$)/g, '');

				// Check if slug already exists
				const existingCategory = await db.Category.findOne({
					where: { slug: slug }
				});

				if (existingCategory) {
					resolve({
						errCode: 2,
						errMessage: 'Category with this slug already exists'
					});
					return;
				}

				// Create category
				let category = await db.Category.create({
					name: bodyData.name,
					slug: slug,
					description: bodyData.description || '',
					status: bodyData.status || 'active'
				});

				resolve({
					errCode: 0,
					errMessage: 'Create category successfully',
					data: category
				});
			}
		} catch (e) {
			reject(e);
		}
	});
}

// Update category
let updateCategory = (inputId, inputData) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let category = await db.Category.findOne({
					where: { id: inputId },
					raw: false
				});

				if (!category) {
					resolve({
						errCode: 2,
						errMessage: 'Category not found'
					});
				} else {
					// If name is updated, regenerate slug
					if (inputData.name && inputData.name !== category.name) {
						let slug = inputData.slug || inputData.name.toLowerCase()
							.replace(/[^a-z0-9]+/g, '-')
							.replace(/(^-|-$)/g, '');

						// Check if new slug already exists (excluding current category)
						const existingCategory = await db.Category.findOne({
							where: { 
								slug: slug,
								id: { [Op.ne]: inputId }
							}
						});

						if (existingCategory) {
							resolve({
								errCode: 2,
								errMessage: 'Category with this slug already exists'
							});
							return;
						}

						inputData.slug = slug;
					}

					// Update fields
					if (inputData.name) category.name = inputData.name;
					if (inputData.slug) category.slug = inputData.slug;
					if (inputData.description !== undefined) category.description = inputData.description;
					if (inputData.status) category.status = inputData.status;

					await category.save();

					resolve({
						errCode: 0,
						errMessage: 'Update category successfully',
						data: category
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
}

// Delete category
let deleteCategory = (inputId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: 'Missing required parameter: id'
				});
			} else {
				let category = await db.Category.findOne({
					where: { id: inputId },
					raw: false
				});

				if (!category) {
					resolve({
						errCode: 2,
						errMessage: 'Category not found'
					});
				} else {
					// Check if category has products
					const productCount = await db.Product.count({
						where: { category_id: inputId }
					});

					if (productCount > 0) {
						resolve({
							errCode: 3,
							errMessage: `Cannot delete category. There are ${productCount} product(s) associated with this category`
						});
					} else {
						await category.destroy();

						resolve({
							errCode: 0,
							errMessage: 'Delete category successfully'
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
	getAllCategories: getAllCategories,
	getCategoryById: getCategoryById,
	createCategory: createCategory,
	updateCategory: updateCategory,
	deleteCategory: deleteCategory
}

