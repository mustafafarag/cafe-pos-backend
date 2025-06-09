'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, { as: 'cashier', foreignKey: 'cashierId' })
      Order.belongsTo(models.User, { as: 'waiter', foreignKey: 'waiterId' })
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' })
    }
  }
  Order.init({
    status: DataTypes.STRING,
    totalCost: DataTypes.FLOAT,
    waiterId: DataTypes.INTEGER,
    cashierId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};