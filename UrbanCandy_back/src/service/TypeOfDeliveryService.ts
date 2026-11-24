import TypeOfDeliveryRepository from '../repositories/TypeOfDeliveryRepository.js';
import TypeOfDelivery from '../models/TypeOfDelivery.js';
import { ApiException } from '../exception/ApiException.js';

class TypeOfDeliveryService {
  private validateName(type: TypeOfDelivery) {
    if (!type.name?.trim()) {
      throw new ApiException('INVALID_TYPE_OF_DELIVERY_NAME', 400);
    }
  }

  private async verifyName(type: TypeOfDelivery, id?: number) {
    const exists = await TypeOfDeliveryRepository.findByName(type.name);

    if (exists && exists.id_type_delivery !== id) {
      throw new ApiException('TYPE_OF_DELIVERY_ALREADY_EXISTS', 409);
    }
  }

  async findAll(page = 1, size = 10) {
    return TypeOfDeliveryRepository.findAll(size, (page - 1) * size);
  }

  async findById(id: number) {
    const type = await TypeOfDeliveryRepository.findById(id);

    if (!type) {
      throw new ApiException('TYPE_OF_DELIVERY_NOT_FOUND', 404, id);
    }

    return type;
  }

  async create(type: TypeOfDelivery) {
    this.validateName(type);
    await this.verifyName(type);

    return TypeOfDeliveryRepository.create(type);
  }

  async update(id: number, type: TypeOfDelivery) {
    if (!id) {
      throw new ApiException('INVALID_TYPE_OF_DELIVERY_ID', 400);
    }

    await this.findById(id);

    this.validateName(type);
    await this.verifyName(type, id);

    return TypeOfDeliveryRepository.update(id, type);
  }

  async delete(id: number) {
    await this.findById(id);

    return TypeOfDeliveryRepository.delete(id);
  }
}

export default new TypeOfDeliveryService();
