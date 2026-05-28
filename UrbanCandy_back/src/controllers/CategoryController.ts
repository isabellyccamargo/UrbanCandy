import { type Request, type Response, type NextFunction } from 'express';
import CategoryService from '../service/CategoryService.js';
import Categories from '../models/Categories.js';
import { ApiException } from '../exception/ApiException.js';

class CategoryController {
  static async findAllCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 6;

      const result = await CategoryService.findAllCategory(page, size);
      res.status(200).json({
        totalItems: result.count,
        totalPages: Math.ceil(result.count / size),
        currentPage: page,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByIdCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_category } = req.params;
      if (!id_category || Array.isArray(id_category)) {
        throw new ApiException('INVALID_ID', 400, 'id_category');
      }

      const id: number = Number(id_category);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_category);
      }

      const category = await CategoryService.findByIdCategory(id);
      if (!category) {
        throw new ApiException('CATEGORY_NOT_FOUND', 404, id);
      }
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryInstance = Categories.build(req.body);
      const newCategory = await CategoryService.createCategory(categoryInstance);

      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idCategory } = req.params;
      if (!idCategory || Array.isArray(idCategory)) {
        throw new ApiException('INVALID_ID', 400, 'idCategory');
      }

      const id: number = Number(idCategory);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, idCategory);
      }

      const categoryInstance = Categories.build(req.body);
      await CategoryService.updateCategory(id, categoryInstance);
      res.status(200).json({
        message: 'Categoria atualizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_category } = req.params;
      if (!id_category || Array.isArray(id_category)) {
        throw new ApiException('INVALID_ID', 400, 'id_category');
      }

      const id: number = Number(id_category);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_category);
      }
      await CategoryService.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
