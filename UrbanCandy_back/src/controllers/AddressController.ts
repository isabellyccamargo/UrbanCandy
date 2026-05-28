import { type Request, type Response, type NextFunction } from 'express';
import AddressService from '../service/AddressService.js';
import { ApiException } from '../exception/ApiException.js';

class AddressController {
  static async createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await AddressService.createAddress(req.body);
      res.status(201).json(address);
    } catch (error) {
      next(error);
    }
  }

  static async findAllAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, size } = req.query;
      const result = await AddressService.findAllAddresses(Number(page) || 1, Number(size) || 6);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findByIdAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_address } = req.params;
      if (!id_address || Array.isArray(id_address)) {
        throw new ApiException('INVALID_ID', 400, 'undefined');
      }

      const id: number = Number(id_address);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_address);
      }

      const address = await AddressService.findByIdAddress(id);
      if (!address) {
        throw new ApiException('ADDRESS_NOT_FOUND', 404, id);
      }
      res.status(200).json(address);
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_address } = req.params;
      if (!id_address || Array.isArray(id_address)) {
        throw new ApiException('INVALID_ID', 400, 'undefined');
      }

      const id: number = Number(id_address);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_address);
      }

      await AddressService.updateAddress(id, req.body);

      res.status(200).json({
        message: 'Endereço atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_address } = req.params;
      if (!id_address || Array.isArray(id_address)) {
        throw new ApiException('INVALID_ID', 400, 'undefined');
      }

      const id: number = Number(id_address);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_address);
      }

      await AddressService.deleteAddress(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default AddressController;
