module.exports = (sequelize, DataTypes) => {
  const QrCode = sequelize.define('QrCode', {
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    umbrella_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qr_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  QrCode.associate = (models) => {
    QrCode.belongsTo(models.Business, {
      foreignKey: 'business_id',
      onDelete: 'CASCADE',
    });
  };

  return QrCode;
};
