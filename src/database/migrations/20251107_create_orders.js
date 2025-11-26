module.exports = {
	up: async (queryInterface, DataTypes) => {
		await queryInterface.createTable('orders', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			customer_id: { type: DataTypes.INTEGER, allowNull: false },
			status: { type: DataTypes.ENUM('pending','paid','shipped','completed','cancelled'), defaultValue: 'pending' },
			total_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
			shipping_address_id: { type: DataTypes.INTEGER },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('orders');
	}
};


