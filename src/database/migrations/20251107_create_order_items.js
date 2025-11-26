module.exports = {
	up: async (queryInterface, DataTypes) => {
		await queryInterface.createTable('order_items', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			order_id: { type: DataTypes.INTEGER, allowNull: false },
			product_id: { type: DataTypes.INTEGER, allowNull: false },
			quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
			unit_price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('order_items');
	}
};


