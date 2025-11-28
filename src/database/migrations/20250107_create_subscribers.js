module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('subscribers', {
			id: { 
				type: Sequelize.INTEGER, 
				primaryKey: true, 
				autoIncrement: true 
			},
			email: { 
				type: Sequelize.STRING(180), 
				allowNull: false,
				unique: true
			},
			full_name: { 
				type: Sequelize.STRING(200), 
				allowNull: true 
			},
			status: { 
				type: Sequelize.ENUM('active', 'unsubscribed', 'bounced'), 
				defaultValue: 'active' 
			},
			source: {
				type: Sequelize.STRING(50),
				allowNull: true,
				defaultValue: 'website'
			},
			mailchimp_id: {
				type: Sequelize.STRING(100),
				allowNull: true
			},
			created_at: { 
				type: Sequelize.DATE, 
				allowNull: false, 
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
			},
			updated_at: { 
				type: Sequelize.DATE, 
				allowNull: false, 
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
			}
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable('subscribers');
	}
};

