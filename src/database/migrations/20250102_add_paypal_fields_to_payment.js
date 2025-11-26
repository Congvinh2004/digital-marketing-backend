module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Kiểm tra xem các cột đã tồn tại chưa
		const tableDescription = await queryInterface.describeTable('payment');
		
		if (!tableDescription.paypal_order_id) {
			await queryInterface.addColumn('payment', 'paypal_order_id', {
				type: Sequelize.STRING(255),
				allowNull: true
			});
		}

		if (!tableDescription.paypal_transaction_id) {
			await queryInterface.addColumn('payment', 'paypal_transaction_id', {
				type: Sequelize.STRING(255),
				allowNull: true
			});
		}
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('payment', 'paypal_order_id');
		await queryInterface.removeColumn('payment', 'paypal_transaction_id');
	}
};



