module.exports = (sequelize, DataTypes) => {
	const Subscriber = sequelize.define('Subscriber', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		email: { 
			type: DataTypes.STRING(180), 
			unique: true, 
			allowNull: false,
			validate: {
				isEmail: true
			}
		},
		full_name: { 
			type: DataTypes.STRING(200), 
			allowNull: true 
		},
		status: { 
			type: DataTypes.ENUM('active', 'unsubscribed', 'bounced'), 
			defaultValue: 'active' 
		},
		source: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: 'website' // 'website', 'admin', 'api'
		},
		mailchimp_id: {
			type: DataTypes.STRING(100),
			allowNull: true
		}
	}, {
		tableName: 'subscribers',
		underscored: true,
		timestamps: true
	});

	return Subscriber;
};

