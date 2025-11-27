module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Kiểm tra xem cột discount_percent đã tồn tại chưa
		const tableDescription = await queryInterface.describeTable('products');
		
		if (!tableDescription.discount_percent) {
			await queryInterface.addColumn('products', 'discount_percent', {
				type: Sequelize.DECIMAL(5,2),
				allowNull: true,
				defaultValue: 0
			});
		}
	},
	down: async (queryInterface) => {
		const tableDescription = await queryInterface.describeTable('products');
		
		if (tableDescription.discount_percent) {
			await queryInterface.removeColumn('products', 'discount_percent');
		}
	}
};

