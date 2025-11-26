module.exports = (sequelize, DataTypes) => {
	const Address = sequelize.define('Address', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		customer_id: { type: DataTypes.INTEGER, allowNull: false },
		full_name: { type: DataTypes.STRING(150), allowNull: false },
		phone: { type: DataTypes.STRING(30), allowNull: false },
		province: { type: DataTypes.STRING(120), allowNull: false },
		district: { type: DataTypes.STRING(120), allowNull: false },
		ward: { type: DataTypes.STRING(120), allowNull: false },
		detail: { type: DataTypes.STRING(255), allowNull: false },
		is_default: { type: DataTypes.BOOLEAN, defaultValue: false }
	}, {
		tableName: 'addresses',
		underscored: true,
		timestamps: true
	});

	Address.associate = models => {
		Address.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
		Address.hasMany(models.Order, { foreignKey: 'shipping_address_id', as: 'orders' });
	};

	return Address;
};


