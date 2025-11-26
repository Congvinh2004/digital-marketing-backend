module.exports = (sequelize, DataTypes) => {
	const Customer = sequelize.define('Customer', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		full_name: { type: DataTypes.STRING(200), allowNull: false },
		email: { type: DataTypes.STRING(180), unique: true },
		phone: { type: DataTypes.STRING(30), unique: true },
		password_hash: { type: DataTypes.STRING(255) },
		status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
	}, {
		tableName: 'customers',
		underscored: true,
		timestamps: true
	});

	Customer.associate = models => {
		Customer.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });
	};

	return Customer;
};


