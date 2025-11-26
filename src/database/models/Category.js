module.exports = (sequelize, DataTypes) => {
	const Category = sequelize.define('Category', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(150), allowNull: false },
		slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
		description: { type: DataTypes.TEXT },
		status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
	}, {
		tableName: 'categories',
		underscored: true,
		timestamps: true
	});

	Category.associate = models => {
		Category.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });
	};

	return Category;
};


