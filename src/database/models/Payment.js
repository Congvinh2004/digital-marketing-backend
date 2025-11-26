module.exports = (sequelize, DataTypes) => {
	const Payment = sequelize.define('Payment', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		orderId: { 
			type: DataTypes.INTEGER, 
			field: 'orderId',
			allowNull: true 
		},
		paymentMethod: { 
			type: DataTypes.STRING(255), 
			field: 'paymentMethod',
			allowNull: true 
		},
		paymentStatus: { 
			type: DataTypes.STRING(255), 
			field: 'paymentStatus',
			allowNull: true 
		},
		paymentDate: { 
			type: DataTypes.DATE, 
			field: 'paymentDate',
			allowNull: true 
		},
		paypalOrderId: {
			type: DataTypes.STRING(255),
			field: 'paypal_order_id',
			allowNull: true
		},
		paypalTransactionId: {
			type: DataTypes.STRING(255),
			field: 'paypal_transaction_id',
			allowNull: true
		},
		totalAmountUSD: {
			type: DataTypes.DECIMAL(12, 2),
			field: 'total_amount_usd',
			allowNull: true
		},
		currency: {
			type: DataTypes.STRING(10),
			field: 'currency',
			allowNull: true,
			defaultValue: 'USD'
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
		tableName: 'payment',
		underscored: false,
		timestamps: true,
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	});

	Payment.associate = models => {
		Payment.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
	};

	return Payment;
};

