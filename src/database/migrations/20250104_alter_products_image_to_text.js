module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Kiểm tra xem cột image có tồn tại không
		const tableDescription = await queryInterface.describeTable('products');
		
		if (tableDescription.image) {
			// Thay đổi kiểu dữ liệu từ VARCHAR(255) sang LONGTEXT
			await queryInterface.changeColumn('products', 'image', {
				type: Sequelize.TEXT('long'),
				allowNull: true
			});
		} else {
			// Nếu cột chưa tồn tại, thêm cột mới
			await queryInterface.addColumn('products', 'image', {
				type: Sequelize.TEXT('long'),
				allowNull: true
			});
		}
	},

	down: async (queryInterface, Sequelize) => {
		// Rollback: đổi lại về STRING(255)
		const tableDescription = await queryInterface.describeTable('products');
		
		if (tableDescription.image) {
			await queryInterface.changeColumn('products', 'image', {
				type: Sequelize.STRING(255),
				allowNull: true
			});
		}
	}
};


