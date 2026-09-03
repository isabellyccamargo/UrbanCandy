import Orders from '../models/Orders.js';
import People from '../models/People.js';
import OrderItem from '../models/OrderItem.js';
import Products from '../models/Products.js';
import TypeOfPayment from '../models/TypeOfPayment.js';
import TypeOfDelivery from '../models/TypeOfDelivery.js';
import OrderStatus from '../models/OrderStatus.js'; // <-- IMPORT ADICIONADO
import sequelize from '../config/Config.js';
import {
  type Order as SequelizeOrder,
  Transaction,
  type FindAndCountOptions,
} from 'sequelize';
import {
  type ICartItem,
  type IPaginatedResponse,
} from '../@types/OrdersTypes.js';

class OrderRepository {
  private async _createItems(
    id_order: number,
    items: ICartItem[],
    t: Transaction
  ): Promise<void> {
    const formatted = items.map((item) => {
      const price = item.products?.price
        ? Number(item.products.price)
        : 0;

      const quantity = item.quantity || 1;

      const subTotal = item.sub_total
        ? Number(item.sub_total)
        : price * quantity;

      return {
        id_order,
        id_product: item.id_product,
        quantity,
        unit_price: price,
        sub_total: subTotal,
      };
    });

    await OrderItem.bulkCreate(formatted, {
      transaction: t,
    });
  }

  async createFullOrder(
    id_people: number,
    items: ICartItem[],
    total: number,
    id_payment: number,
    id_type_delivery: number,
    status_id: number = 1 // Recebe o status_id inicial (default: 1)
  ): Promise<Orders> {
    const t = await sequelize.transaction();

    try {
      const order = await Orders.create(
        {
          id_people: Number(id_people),
          total: Number(total),
          id_payment: Number(id_payment),
          id_type_delivery: Number(id_type_delivery),
          status_id: Number(status_id), // Mapeado para a coluna status_id
        },
        { transaction: t }
      );

      await this._createItems(
        order.id_orders,
        items,
        t
      );

      await t.commit();

      return order;
    } catch (error) {
      await t.rollback();
      console.error(
        'ERRO REPOSITORY (createFullOrder):',
        error
      );
      throw error;
    }
  }

  async findAllOrders(
    limit: number,
    offset: number
  ): Promise<IPaginatedResponse<Orders>> {
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
          model: TypeOfDelivery,
          as: 'deliveryType',
          attributes: ['name'],
        },
        {
          model: OrderStatus,
          as: 'status',
          attributes: ['id', 'name', 'label'], // Atributos ajustados
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Products,
              as: 'products',
              attributes: [
                'id_product',
                'name',
                'description',
                'price',
              ],
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
      where: { id_people },
      distinct: true,
      col: 'id_orders',
      include: [
        {
          model: TypeOfPayment,
          as: 'paymentType',
          attributes: ['name_payment'],
          required: false,
        },
        {
          model: TypeOfDelivery,
          as: 'deliveryType',
          attributes: ['name'],
          required: false,
        },
        {
          model: OrderStatus,
          as: 'status',
          attributes: ['id', 'name', 'label'], // Ajustado 'id_order_status' para 'id'
          required: false,
        },
        {
          model: OrderItem,
          as: 'items',
          required: false,
          include: [
            {
              model: Products,
              as: 'products',
              required: false,
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

  async findAllStatuses(): Promise<OrderStatus[]> {
    return await OrderStatus.findAll();
  }

  async updateOrderStatus(
    id_orders: number,
    status_id: number
  ): Promise<[number]> {
    return await Orders.update(
      { status_id },
      { where: { id_orders } }
    );
  }
}

export default new OrderRepository();