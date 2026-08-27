import Users from './Users.js';
import People from './People.js';
import Address from './Address.js';
import Orders from './Orders.js';
import OrderItem from './OrderItem.js';
import Products from './Products.js';
import TypeOfPayment from './TypeOfPayment.js';

const setupAssociations = () => {
  Users.hasOne(People, { foreignKey: 'id_user', as: 'people' });
  People.belongsTo(Users, { foreignKey: 'id_user', as: 'user' });
  People.belongsTo(Address, { foreignKey: 'id_address', as: 'address' });
  Address.hasMany(People, { foreignKey: 'id_address', as: 'residents' });

  Orders.belongsTo(TypeOfPayment, { foreignKey: 'id_payment', as: 'paymentType' });
  Orders.belongsTo(People, { foreignKey: 'id_people', as: 'people' });
  Orders.hasMany(OrderItem, { foreignKey: 'id_order', as: 'items' });
  OrderItem.belongsTo(Orders, { foreignKey: 'id_order', as: 'orders' });
  OrderItem.belongsTo(Products, { foreignKey: 'id_product', as: 'products' });
};

export { setupAssociations };
