import Orders from '../models/Orders.js';
import People from '../models/People.js';
import OrderItem from '../models/OrderItem.js';
import Products from '../models/Products.js';
import TypeOfPayment from '../models/TypeOfPayment.js';
import TypeOfDelivery from '../models/TypeOfDelivery.js';
import OrderStatus from '../models/OrderStatus.js';
import sequelize from '../config/Config.js';
import { type Order as SequelizeOrder, Transaction, type FindAndCountOptions } from 'sequelize';
import { randomUUID } from 'node:crypto';
import { type ICartItem, type IPaginatedResponse } from '../@types/OrdersTypes.js';
import OrderStatusOutbox, {
  type OrderStatusOutboxEvent,
} from '../models/OrderStatusOutbox.js';

class OrderRepository {
  private async _createItems(id_order: number, items: ICartItem[], t: Transaction): Promise<void> {
    const formatted = items.map((item) => {
      const price = item.products?.price ? Number(item.products.price) : 0;

      const quantity = item.quantity || 1;

      const subTotal = item.sub_total ? Number(item.sub_total) : price * quantity;

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
    status_id: number = 1,
    transaction?: Transaction
  ): Promise<Orders> {
    const t = transaction ?? (await sequelize.transaction());

    try {
      const order = await Orders.create(
        {
          id_people: Number(id_people),
          total: Number(total),
          id_payment: Number(id_payment),
          id_type_delivery: Number(id_type_delivery),
          status_id: Number(status_id),
        },
        { transaction: t }
      );

      await this._createItems(order.id_orders, items, t);

      if (!transaction) await t.commit();

      return order;
    } catch (error) {
      if (!transaction) await t.rollback();
      console.error('ERRO REPOSITORY (createFullOrder):', error);
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
          // CORREÇÃO: Adicionado 'telephone' para retornar o telefone ao front-end
          attributes: ['id_people', 'name', 'telephone', 'cpf'],
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
          attributes: ['id', 'name', 'label'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Products,
              as: 'products',
              attributes: ['id_product', 'name', 'description', 'price', 'image'],
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
          attributes: ['id', 'name', 'label'],
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

  async findById(id_order: number): Promise<Orders | null> {
    return await Orders.findByPk(id_order, {
      include: [
        {
          model: OrderStatus,
          as: 'status',
          attributes: ['id', 'name', 'label'],
        },
        // ... outros includes se necessário para contexto adicional do pedido ...
      ],
    });
  }

  async findAllStatuses(): Promise<OrderStatus[]> {
    return await OrderStatus.findAll();
  }

  async findStatusById(id: number): Promise<OrderStatus | null> {
    return await OrderStatus.findByPk(id);
  }

  async updateOrderStatus(id_orders: number, status_id: number): Promise<[number]> {
    return await Orders.update({ status_id }, { where: { id_orders } });
  }

  async updateOrderStatusAndQueueEvent(
    idOrder: number,
    previousStatusId: number,
    newStatusId: number,
    recipientUserId: number,
    recipientEmail: string,
    newStatusLabel: string
  ): Promise<OrderStatusOutboxEvent | null> {
    return sequelize.transaction(async (transaction) => {
      const order = await Orders.findByPk(idOrder, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order || Number(order.status_id) !== previousStatusId) return null;

      const event: OrderStatusOutboxEvent = {
        eventId: randomUUID(),
        occurredAt: new Date().toISOString(),
        orderId: idOrder,
        previousStatusId,
        newStatusId,
        recipientUserId,
        recipientEmail,
        newStatusLabel,
      };

      await order.update({ status_id: newStatusId }, { transaction });
      await OrderStatusOutbox.create(
        { eventId: event.eventId, payload: event, acknowledgedAt: null },
        { transaction }
      );
      return event;
    });
  }
}

export default new OrderRepository();
