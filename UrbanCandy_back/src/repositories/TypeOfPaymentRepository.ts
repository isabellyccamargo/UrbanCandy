import TypeOfPayment from '../models/TypeOfPayment.js';

class TypeOfPaymentRepository {
  async findAllTypeOfPayment(limit: number, offset: number) {
    return await TypeOfPayment.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['id_payment', 'ASC']],
    });
  }

  async findByIdTypeOfPayment(id_payment: number) {
    return await TypeOfPayment.findByPk(id_payment);
  }

  async findByName(name_payment: string) {
    return await TypeOfPayment.findOne({
      where: { name_payment: name_payment },
    });
  }

  async createTypeOfPayment(type: TypeOfPayment) {
    return await type.save();
  }

  async updateTypeOfPayment(id: number, type: TypeOfPayment) {
    return await TypeOfPayment.update(
      {
        name_payment: type.name_payment,
      },
      {
        where: { id_payment: id },
      }
    );
  }

  async deleteTypeOfPayment(id: number) {
    return await TypeOfPayment.destroy({
      where: { id_payment: id },
    });
  }
}

export default new TypeOfPaymentRepository();
