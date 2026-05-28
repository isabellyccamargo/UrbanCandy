import TypeOfPaymentRepository from '../repositories/TypeOfPaymentRepository.js';
import TypeOfPayment from '../models/TypeOfPayment.js';
import { ApiException } from '../exception/ApiException.js';

class TypeOfPaymentService {
  private validateName(type: TypeOfPayment): void {
    if (!type.name_payment || type.name_payment.trim() === '') {
      throw new ApiException('INVALID_TYPE_OF_PAYMENT_NAME', 400);
    }
  }

  private async verifyNameNotExists(type: TypeOfPayment, typeId?: number): Promise<void> {
    const typeEntity = await TypeOfPaymentRepository.findByName(type.name_payment);

    if (typeEntity && typeEntity.id_payment !== typeId) {
      throw new ApiException('TYPE_OF_PAYMENT_ALREADY_EXISTS', 409);
    }
  }

  async findAllTypeOfPayment(
    page: number = 1,
    size: number = 10
  ): Promise<{ rows: TypeOfPayment[]; count: number }> {
    const offset = (page - 1) * size;
    return await TypeOfPaymentRepository.findAllTypeOfPayment(size, offset);
  }

  async findByIdTypeOfPayment(typeId: number): Promise<TypeOfPayment> {
    const type = await TypeOfPaymentRepository.findByIdTypeOfPayment(typeId);
    if (!type) throw new ApiException('TYPE_OF_PAYMENT_NOT_FOUND', 404, typeId);
    return type;
  }

  async createTypeOfPayment(type: TypeOfPayment): Promise<TypeOfPayment> {
    this.validateName(type);
    await this.verifyNameNotExists(type);
    return await TypeOfPaymentRepository.createTypeOfPayment(type);
  }

  async updateTypeOfPayment(id: number, type: TypeOfPayment): Promise<[number]> {
    if (!id) throw new ApiException('INVALID_TYPE_OF_PAYMENT_ID', 400);
    this.validateName(type);
    await this.findByIdTypeOfPayment(id);
    await this.verifyNameNotExists(type, id);
    return await TypeOfPaymentRepository.updateTypeOfPayment(id, type);
  }

  async deleteTypeOfPayment(id: number): Promise<number> {
    await this.findByIdTypeOfPayment(id);
    return await TypeOfPaymentRepository.deleteTypeOfPayment(id);
  }
}

export default new TypeOfPaymentService();
