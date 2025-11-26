module.exports = {
	up: async (queryInterface, DataTypes) => {
		await queryInterface.createTable('categories', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			name: { type: DataTypes.STRING(150), allowNull: false },
			slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
			description: { type: DataTypes.TEXT },
			status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('categories');
	}
};


