module.exports = {
	up: async (queryInterface, DataTypes) => {
		await queryInterface.createTable('addresses', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			customer_id: { type: DataTypes.INTEGER, allowNull: false },
			full_name: { type: DataTypes.STRING(150), allowNull: false },
			phone: { type: DataTypes.STRING(30), allowNull: false },
			province: { type: DataTypes.STRING(120), allowNull: false },
			district: { type: DataTypes.STRING(120), allowNull: false },
			ward: { type: DataTypes.STRING(120), allowNull: false },
			detail: { type: DataTypes.STRING(255), allowNull: false },
			is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('addresses');
	}
};


