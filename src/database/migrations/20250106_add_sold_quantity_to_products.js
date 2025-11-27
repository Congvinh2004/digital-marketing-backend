module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Kiểm tra xem cột sold_quantity đã tồn tại chưa
		const tableDescription = await queryInterface.describeTable('products');
		
		if (!tableDescription.sold_quantity) {
			await queryInterface.addColumn('products', 'sold_quantity', {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0
			});
		}
	},
	down: async (queryInterface) => {
		const tableDescription = await queryInterface.describeTable('products');
		
		if (tableDescription.sold_quantity) {
			await queryInterface.removeColumn('products', 'sold_quantity');
		}
	}
};

