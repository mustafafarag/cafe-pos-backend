'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' })
      OrderItem.belongsTo(models.Item, { foreignKey: 'itemId' })
    }
  }
  OrderItem.init({
    orderId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    priceSnapshot: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};