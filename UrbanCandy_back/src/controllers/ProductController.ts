import { type Request, type Response, type NextFunction } from 'express';
import ProductService from '../service/ProductService.js';
import Products from '../models/Products.js';
import { ApiException } from '../exception/ApiException.js';

interface PaginatedResult {
  rows: Products[];
  count: number;
}

class ProductController {
  private static parseId = (req: Request): number => {
    const { id_product } = req.params;
    const id = Number(id_product);

    if (!id_product || isNaN(id)) {
      throw new ApiException('INVALID_ID', 400, String(req.params.id_product || ''));
    }
    return id;
  };

  private static format = (
    res: Response,
    result: PaginatedResult,
    page: number,
    size: number
  ): Response => {
    return res.status(200).json({
      totalItems: result.count,
      totalPages: Math.ceil(result.count / size),
      currentPage: page,
      data: result.rows,
    });
  };

  static findAllProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 6;

      const result = await ProductService.findAllProduct(page, size);

      res.status(200).json({
        data: result.rows,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / size),
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  };

  static findFeaturedProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 6;
      const result = await ProductService.findFeaturedProducts(page, size);
      this.format(res, result, page, size);
    } catch (error) {
      next(error);
    }
  };

  static findByIdProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.parseId(req);
      const product = await ProductService.findByIdProduct(id);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  static findByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 6;
      const category = String(req.params.categoryName);
      const result = await ProductService.findByCategory(category, page, size);
      this.format(res, result, page, size);
    } catch (error) {
      next(error);
    }
  };

  static createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dados = req.body;
      if (req.file) dados.image = req.file.filename;

      if (dados.featured !== undefined) {
        dados.featured = String(dados.featured) === 'true';
      }

      const newProduct = await ProductService.createProduct(Products.build(dados));
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  };

  static updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parseId(req);
      const dados = req.body;

      if (req.file) {
        dados.image = req.file.filename;
      }

      if (dados.featured !== undefined) {
        dados.featured = String(dados.featured) === 'true';
      }

      const instance = Products.build({ id_product: id, ...dados });
      await ProductService.updateProduct(instance);
      res.status(200).json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  };
  static deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parseId(req);
      await ProductService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default ProductController;
