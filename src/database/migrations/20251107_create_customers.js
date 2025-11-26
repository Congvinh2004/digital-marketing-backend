module.exports = {
	up: async (queryInterface, DataTypes) => {
		await queryInterface.createTable('customers', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			full_name: { type: DataTypes.STRING(200), allowNull: false },
			email: { type: DataTypes.STRING(180), unique: true },
			phone: { type: DataTypes.STRING(30), unique: true },
			password_hash: { type: DataTypes.STRING(255) },
			status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('customers');
	}
};


