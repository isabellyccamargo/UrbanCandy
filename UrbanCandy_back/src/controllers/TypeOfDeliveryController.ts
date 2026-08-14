import { type Request, type Response, type NextFunction } from 'express';

import TypeOfDeliveryService from '../service/TypeOfDeliveryService.js';
import TypeOfDelivery from '../models/TypeOfDelivery.js';
import { ApiException } from '../exception/ApiException.js';

class TypeOfDeliveryController {
    static async findAll(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const size = Number(req.query.size) || 10;

            const result =
                await TypeOfDeliveryService.findAll(
                    page,
                    size
                );

            res.status(200).json(result.rows);

        } catch (error) {
            console.error(
                '========== ERRO TIPO DE ENTREGA =========='
            );
            console.error(error);

            next(error);
        }
    }
    static async findById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id_type_delivery } = req.params;
            const id = Number(id_type_delivery);

            if (!id_type_delivery || Number.isNaN(id)) {
                throw new ApiException('INVALID_ID', 400, id_type_delivery);
            }

            const type = await TypeOfDeliveryService.findById(id);

            res.status(200).json(type);
        } catch (error) {
            next(error);
        }
    }

    static async create(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const type = TypeOfDelivery.build(req.body);

            const newType = await TypeOfDeliveryService.create(type);

            res.status(201).json(newType);
        } catch (error) {
            next(error);
        }
    }

    static async update(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id_delivery } = req.params;
            const id = Number(id_delivery);

            if (!id_delivery || Number.isNaN(id)) {
                throw new ApiException('INVALID_ID', 400, id_delivery);
            }

            const type = TypeOfDelivery.build(req.body);

            await TypeOfDeliveryService.update(id, type);

            res.status(200).json({
                message: 'Tipo de entrega atualizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id_delivery } = req.params;
            const id = Number(id_delivery);

            if (!id_delivery || Number.isNaN(id)) {
                throw new ApiException('INVALID_ID', 400, id_delivery);
            }

            await TypeOfDeliveryService.delete(id);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default TypeOfDeliveryController;