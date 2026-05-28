import OrderItem from '../models/OrderItem.js';
import Products from '../models/Products.js';

class OrderItemRepository {
  async findAllItems(limit: number, offset: number) {
    return await OrderItem.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: Products,
          as: 'products',
          attributes: ['id_product', 'name', 'price'],
        },
      ],
      order: [['id_orderItem', 'ASC']],
    });
  }

  async findItemsByOrder(id_order: number) {
    return await OrderItem.findAll({
      where: { id_order },
      include: [
        {
          model: Products,
          as: 'products',
          attributes: ['id_product', 'name', 'price', 'image'],
        },
      ],
    });
  }

  async findItem(id_order: number, id_product: number) {
    return await OrderItem.findOne({
      where: {
        id_order,
        id_product,
      },
    });
  }

  async createItem(orderItem: OrderItem) {
    return await orderItem.save();
  }

  async updateItem(id_orderItem: number, quantity: number, sub_total: number) {
    return await OrderItem.update(
      {
        quantity,
        sub_total,
      },
      {
        where: { id_orderItem },
      }
    );
  }

  async deleteItem(id_orderItem: number) {
    return await OrderItem.destroy({
      where: { id_orderItem },
    });
  }
}

export default new OrderItemRepository();
