module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('categories', {
			id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
			name: { type: Sequelize.STRING(150), allowNull: false },
			slug: { type: Sequelize.STRING(180), allowNull: false, unique: true },
			description: { type: Sequelize.TEXT },
			status: { type: Sequelize.ENUM('active','inactive'), defaultValue: 'active' },
			created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
			updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('categories');
	}
};


