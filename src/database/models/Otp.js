module.exports = (sequelize, DataTypes) => {
	const Otp = sequelize.define('Otp', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		email: { type: DataTypes.STRING(180), allowNull: false },
		otp_code: { type: DataTypes.STRING(6), allowNull: false },
		expires_at: { type: DataTypes.DATE, allowNull: false },
		is_used: { type: DataTypes.BOOLEAN, defaultValue: false }
	}, {
		tableName: 'otps',
		underscored: true,
		timestamps: true
	});

	return Otp;
};



