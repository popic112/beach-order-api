'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QrCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  QrCode.init({
    business_id: DataTypes.INTEGER,
    umbrella_number: DataTypes.INTEGER,
    qr_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'QrCode',
  });
  return QrCode;
};