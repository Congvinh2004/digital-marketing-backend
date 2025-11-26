module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		email: { type: DataTypes.STRING(180), unique: true, allowNull: false },
		password: { type: DataTypes.STRING(255), allowNull: false },
		full_name: { type: DataTypes.STRING(150) },
		phone: { type: DataTypes.STRING(30) },
		role: { type: DataTypes.ENUM('customer','admin'), defaultValue: 'customer' },
		status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' }
	}, {
		tableName: 'users',
		underscored: true,
		timestamps: true
	});

	User.associate = models => {
		User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
	};

	return User;
};


