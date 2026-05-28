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
}

export default PeopleController;
