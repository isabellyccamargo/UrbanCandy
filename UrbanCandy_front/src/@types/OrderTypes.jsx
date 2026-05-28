/**
 * @typedef {Object} OrderItem
 * @property {number} id_product
 * @property {number} quantity
 * @property {number} sub_total
 * @property {Object} [products]
 * @property {number} products.price
 * @property {string} products.name
 */

/**
 * @typedef {Object} Order
 * @property {number} id_orders
 * @property {string} order_date
 * @property {number} total
 * @property {number} id_payment
 * @property {OrderItem[]} items
 */

export const OrderModel = {};
