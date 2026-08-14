import TypeOfDelivery from '../models/TypeOfDelivery.js';

class TypeOfDeliveryRepository {

    async findAll(limit: number, offset: number) {
        return TypeOfDelivery.findAndCountAll({
            limit,
            offset,
            order: [['id_type_delivery', 'ASC']],
        });
    }

    async findById(id: number) {
        return TypeOfDelivery.findByPk(id);
    }

    async findByName(name: string) {
        return TypeOfDelivery.findOne({
            where: { name },
        });
    }

    async create(type: TypeOfDelivery) {
        return type.save();
    }

    async update(id: number, type: TypeOfDelivery) {
        return TypeOfDelivery.update(
            {
                name: type.name,
            },
            {
                where: {
                    id_type_delivery: id,
                },
            }
        );
    }

    async delete(id: number) {
        return TypeOfDelivery.destroy({
            where: {
                id_type_delivery: id,
            },
        });
    }
}

export default new TypeOfDeliveryRepository();