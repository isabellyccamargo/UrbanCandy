import Orders from '../models/Orders.js';
import People from '../models/People.js';
import OrderItem from '../models/OrderItem.js';
import Products from '../models/Products.js';
import sequelize from '../config/Config.js';
import { type Order as SequelizeOrder, Transaction, type FindAndCountOptions } from 'sequelize';
import TypeOfPayment from '../models/TypeOfPayment.js';
import { type ICartItem, type IPaginatedResponse } from '../@types/OrdersTypes.js';

class OrderRepository {
  private async _createItems(id_order: number, items: ICartItem[], t: Transaction): Promise<void> {
    const formatted = items.map((item) => {
      const price = item.products?.price ? Number(item.products.price) : 0;
      const quantity = item.quantity || 1;
      const subTotal = item.sub_total ? Number(item.sub_total) : price * quantity;

      return {
        id_order: id_order,
        id_product: item.id_product,
        quantity: quantity,
        unit_price: price,
        sub_total: subTotal,
      };
    });

    await OrderItem.bulkCreate(formatted, { transaction: t });
  }

  async createFullOrder(
    id_people: number,
    items: ICartItem[],
    total: number,
    id_payment: number
  ): Promise<Orders> {
    const t = await sequelize.transaction();
    try {
      const order = await Orders.create(
        {
          id_people: Number(id_people),
          total: Number(total),
          id_payment: Number(id_payment),
        },
        { transaction: t }
      );

      await this._createItems(order.id_orders, items, t);

      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      console.error('ERRO REPOSITORY (createFullOrder):');
      throw error;
    }
  }

  async findAllOrders(limit: number, offset: number): Promise<IPaginatedResponse<Orders>> {
    const options: FindAndCountOptions = {
      distinct: true,
      col: 'id_orders',
      include: [
        {
          model: People,
          as: 'people',
          attributes: ['id_people', 'name'],
        },
        {
          model: TypeOfPayment,
          as: 'paymentType',
          attributes: ['name_payment'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Products,
              as: 'products',
              attributes: ['id_product', 'name', 'description', 'price'],
            },
          ],
        },
      ],
      order: [['id_orders', 'DESC']] as SequelizeOrder,
    };

    if (limit > 0) {
      options.limit = limit;
      options.offset = offset;
    }

    return await Orders.findAndCountAll(options);
  }

  async findByUserId(
    id_people: number,
    limit: number,
    offset: number
  ): Promise<IPaginatedResponse<Orders>> {
    const options: FindAndCountOptions = {
      where: { id_people: id_people },
      distinct: true,
      col: 'id_orders',
      include: [
        {
          model: TypeOfPayment,
          as: 'paymentType',
          attributes: ['name_payment'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Products, as: 'products' }],
        },
      ],
      order: [['id_orders', 'DESC']] as SequelizeOrder,
    };

    if (limit > 0) {
      options.limit = limit;
      options.offset = offset;
    }

    return await Orders.findAndCountAll(options);
  }

  async findOpenOrderByPeople(id_people: number): Promise<Orders | null> {
    return await Orders.findOne({ where: { id_people } });
  }

  async createOrder(id_people: number): Promise<Orders> {
    return await Orders.create({ id_people, total: 0 });
  }

  async updateTotal(id_orders: number, total: number): Promise<[number]> {
    return await Orders.update({ total }, { where: { id_orders } });
  }
}

export default new OrderRepository();
