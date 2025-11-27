module.exports = (sequelize, DataTypes) => {
	const Product = sequelize.define('Product', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		productName: { 
			type: DataTypes.STRING(255), 
			field: 'productName',
			allowNull: true 
		},
		description: { 
			type: DataTypes.STRING(255), 
			field: 'description', 
			allowNull: true 
		},
		price: { 
			type: DataTypes.DECIMAL(12,2), 
			allowNull: true,
			get() {
				const value = this.getDataValue('price');
				return value ? parseFloat(value) : 0;
			}
		},
		quantity: { 
			type: DataTypes.INTEGER, 
			field: 'quantity',
			allowNull: true,
			defaultValue: 0
		},
		category: { 
			type: DataTypes.STRING(255), 
			field: 'category',
			allowNull: true 
		},
		category_id: { 
			type: DataTypes.INTEGER, 
			field: 'category_id',
			allowNull: true 
		},
		image: { 
			type: DataTypes.TEXT('long'), 
			field: 'image',
			allowNull: true 
		},
		discount_percent: { 
			type: DataTypes.DECIMAL(5,2), 
			field: 'discount_percent',
			allowNull: true,
			defaultValue: 0,
			get() {
				const value = this.getDataValue('discount_percent');
				return value ? parseFloat(value) : 0;
			}
		},
		sold_quantity: { 
			type: DataTypes.INTEGER, 
			field: 'sold_quantity',
			allowNull: true,
			defaultValue: 0
		},
		createdAt: { 
			type: DataTypes.DATE, 
			field: 'createdAt',
			allowNull: false 
		},
		updatedAt: { 
			type: DataTypes.DATE, 
			field: 'updatedAt',
			allowNull: false 
		}
	}, {
		tableName: 'products',
		underscored: false, // Tắt vì database dùng camelCase
		timestamps: true,
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	});

	Product.associate = models => {
		Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'categoryInfo' });
		Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'order_items' });
	};

	return Product;
};


