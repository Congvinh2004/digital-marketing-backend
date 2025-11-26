module.exports = {
	up: async (queryInterface, DataTypes) => {
		await queryInterface.createTable('products', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			name: { type: DataTypes.STRING(200), allowNull: false },
			slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
			description: { type: DataTypes.TEXT },
			price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
			sale_price: { type: DataTypes.DECIMAL(12,2) },
			stock: { type: DataTypes.INTEGER, defaultValue: 0 },
			image_url: { type: DataTypes.STRING(500) },
			category_id: { type: DataTypes.INTEGER, allowNull: false },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('products');
	}
};


