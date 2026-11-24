import { type Request, type Response, type NextFunction } from 'express';
import PeopleService from '../service/PeopleService.js';
import People from '../models/People.js';
import { ApiException } from '../exception/ApiException.js';

class PeopleController {
  static async findAllPeople(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, size } = req.query;
      const pageNumber: number = Number(page) || 1;
      const sizeNumber: number = Number(size) || 10;

      const result = await PeopleService.findAllPeople(pageNumber, sizeNumber);
      res.status(200).json({
        totalItems: result.count,
        totalPages: Math.ceil(result.count / sizeNumber),
        currentPage: pageNumber,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByIdPeople(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_people } = req.params;
      if (!id_people || Array.isArray(id_people)) {
        throw new ApiException('INVALID_ID', 400, 'id_people');
      }

      const id: number = Number(id_people);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_people);
      }

      const person = await PeopleService.findByIdPeople(id);
      if (!person) {
        throw new ApiException('PEOPLE_NOT_FOUND', 404, id);
      }
      res.status(200).json(person);
    } catch (error) {
      next(error);
    }
  }

  static async updatePeople(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_people } = req.params;
      if (!id_people || Array.isArray(id_people)) {
        throw new ApiException('INVALID_ID', 400, 'id_people');
      }

      const id: number = Number(id_people);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_people);
      }

      await PeopleService.updatePeople(id, req.body);
      res.status(200).json({
        message: 'Dados pessoais atualizados com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminPeople(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_people } = req.params;
      if (typeof id_people !== 'string' || !/^[1-9]\d*$/.test(id_people)) {
        throw new ApiException('INVALID_ID', 400, 'id_people');
      }

      const id = Number(id_people);
      if (!Number.isSafeInteger(id)) {
        throw new ApiException('INVALID_ID', 400, 'id_people');
      }

      const body = req.body as unknown;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new ApiException('INVALID_REQUEST_BODY', 400);
      }

      const fields = Object.keys(body);
      const data = body as Record<string, unknown>;
      if (
        fields.some((field) => !['name', 'telephone'].includes(field)) ||
        typeof data.name !== 'string' ||
        !data.name.trim() ||
        (data.telephone !== undefined &&
          data.telephone !== null &&
          typeof data.telephone !== 'string')
      ) {
        throw new ApiException('INVALID_REQUEST_BODY', 400);
      }

      const update = {
        name: data.name.trim(),
        ...(data.telephone === undefined
          ? {}
          : { telephone: typeof data.telephone === 'string' ? data.telephone.trim() : null }),
      };
      await PeopleService.updatePeople(id, update as People);
      res.status(200).json({ message: 'Dados pessoais atualizados com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_people } = req.params;

      if (!id_people || Array.isArray(id_people)) {
        throw new ApiException('INVALID_ID', 400, 'id_people');
      }

      const id = Number(id_people);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_people);
      }

      if (!req.file) {
        throw new ApiException('FILE_REQUIRED', 400, 'Envie uma imagem de perfil.');
      }

      // Salva o caminho do arquivo no banco
      const imagePath = `uploads/${req.file.filename}`;
      await PeopleService.updatePeopleImage(id, imagePath);

      res.status(200).json({
        message: 'Foto de perfil atualizada com sucesso',
        image: imagePath,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PeopleController;
