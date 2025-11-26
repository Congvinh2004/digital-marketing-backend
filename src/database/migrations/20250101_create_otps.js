module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('otps', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			email: {
				type: Sequelize.STRING(180),
				allowNull: false
			},
			otp_code: {
				type: Sequelize.STRING(6),
				allowNull: false
			},
			expires_at: {
				type: Sequelize.DATE,
				allowNull: false
			},
			is_used: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
			}
		});

		// Thêm index cho email và otp_code để tìm kiếm nhanh hơn
		await queryInterface.addIndex('otps', ['email']);
		await queryInterface.addIndex('otps', ['otp_code']);
		await queryInterface.addIndex('otps', ['expires_at']);
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('otps');
	}
};



