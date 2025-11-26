module.exports = (sequelize, DataTypes) => {
	const Order = sequelize.define('Order', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		customer_id: { type: DataTypes.INTEGER, allowNull: false },
		user_id: { type: DataTypes.INTEGER, allowNull: true },
		status: { type: DataTypes.ENUM('pending','paid','shipped','completed','cancelled'), defaultValue: 'pending' },
		total_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
		shipping_address_id: { type: DataTypes.INTEGER }
	}, {
		tableName: 'orders',
		underscored: true,
		timestamps: true
	});

	Order.associate = models => {
		Order.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
		Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
		Order.belongsTo(models.Address, { foreignKey: 'shipping_address_id', as: 'shipping_address' });
		Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
	};

	return Order;
};


