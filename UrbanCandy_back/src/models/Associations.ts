import Users from './Users.js';
import People from './People.js';
import Address from './Address.js';
import Orders from './Orders.js';
import OrderItem from './OrderItem.js';
import Products from './Products.js';
import TypeOfPayment from './TypeOfPayment.js';
import Offers from './Offers.js';
import OfferProducts from './OfferProducts.js';
import TypeOfDelivery from './TypeOfDelivery.js';
import OrderStatus from './OrderStatus.js';

import Role from './Role.js';
import Permission from './Permission.js';
import UserRole from './UserRole.js';
import RolePermission from './RolePermission.js';

const setupAssociations = () => {
  Users.hasOne(People, {
    foreignKey: 'id_user',
    as: 'people',
  });

  People.belongsTo(Users, {
    foreignKey: 'id_user',
    as: 'user',
  });

  People.belongsTo(Address, {
    foreignKey: 'id_address',
    as: 'address',
  });

  Address.hasMany(People, {
    foreignKey: 'id_address',
    as: 'residents',
  });

  Orders.belongsTo(OrderStatus, {
    foreignKey: 'status_id',
    targetKey: 'id',
    as: 'status',
  });

  OrderStatus.hasMany(Orders, {
    foreignKey: 'status_id',
    sourceKey: 'id',
    as: 'orders',
  });

  Orders.belongsTo(TypeOfPayment, {
    foreignKey: 'id_payment',
    as: 'paymentType',
  });

  Orders.belongsTo(TypeOfDelivery, {
    foreignKey: 'id_type_delivery',
    as: 'deliveryType',
  });

  Orders.belongsTo(People, {
    foreignKey: 'id_people',
    as: 'people',
  });

  Orders.hasMany(OrderItem, {
    foreignKey: 'id_order',
    as: 'items',
  });

  OrderItem.belongsTo(Orders, {
    foreignKey: 'id_order',
    as: 'orders',
  });

  OrderItem.belongsTo(Products, {
    foreignKey: 'id_product',
    as: 'products',
  });

  Offers.hasMany(OfferProducts, {
    foreignKey: 'id_offer',
    as: 'products',
  });

  OfferProducts.belongsTo(Offers, {
    foreignKey: 'id_offer',
    as: 'offer',
  });

  OfferProducts.belongsTo(Products, {
    foreignKey: 'id_product',
    as: 'product',
  });

  Products.hasMany(OfferProducts, {
    foreignKey: 'id_product',
    as: 'offers',
  });

  Users.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'id_user',
    otherKey: 'id_role',
    as: 'roles',
  });

  Role.belongsToMany(Users, {
    through: UserRole,
    foreignKey: 'id_role',
    otherKey: 'id_user',
    as: 'users',
  });

  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'id_role',
    otherKey: 'id_permission',
    as: 'permissions',
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'id_permission',
    otherKey: 'id_role',
    as: 'roles',
  });

  UserRole.belongsTo(Users, {
    foreignKey: 'id_user',
    as: 'user',
  });

  UserRole.belongsTo(Role, {
    foreignKey: 'id_role',
    as: 'role',
  });

  RolePermission.belongsTo(Role, {
    foreignKey: 'id_role',
    as: 'role',
  });

  RolePermission.belongsTo(Permission, {
    foreignKey: 'id_permission',
    as: 'permission',
  });
};

export { setupAssociations };
