module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Kiểm tra xem các cột đã tồn tại chưa
		const tableDescription = await queryInterface.describeTable('payment');
		
		if (!tableDescription.total_amount_usd) {
			await queryInterface.addColumn('payment', 'total_amount_usd', {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: true
			});
		}

		if (!tableDescription.currency) {
			await queryInterface.addColumn('payment', 'currency', {
				type: Sequelize.STRING(10),
				allowNull: true,
				defaultValue: 'USD'
			});
		}
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('payment', 'total_amount_usd');
		await queryInterface.removeColumn('payment', 'currency');
	}
};



