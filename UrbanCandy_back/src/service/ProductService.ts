import ProductRepository from '../repositories/ProductRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';
import Products from '../models/Products.js';
import { ApiException } from '../exception/ApiException.js';

interface ProductList {
  rows: Products[];
  count: number;
}

class ProductService {
  private validateData(p: Products): void {
    if (!p.name?.trim()) throw new ApiException('INVALID_PRODUCT_NAME', 400);
    if (p.price <= 0) throw new ApiException('INVALID_PRODUCT_PRICE', 400);
    if (!p.id_category) throw new ApiException('INVALID_PRODUCT_CATEGORY', 400);
  }

  async findAllProduct(page: number = 1, size: number = 6) {
    const offset = (page - 1) * size;
    return await ProductRepository.findAllProduct(size, offset);
  }

  async findFeaturedProducts(page: number = 1, size: number = 8): Promise<ProductList> {
    const offset = (page - 1) * size;
    return await ProductRepository.findFeaturedProducts(size, offset);
  }

  async findByIdProduct(id: number): Promise<Products> {
    const product = await ProductRepository.findByIdProduct(id);
    if (!product) throw new ApiException('PRODUCT_NOT_FOUND', 404, id);
    return product;
  }

  async findByCategory(
    categoryName: string,
    page: number = 1,
    size: number = 10
  ): Promise<ProductList> {
    const name = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
    return await ProductRepository.findByCategory(name, size, (page - 1) * size);
  }

  async createProduct(product: Products): Promise<Products> {
    this.validateData(product);
    const categoryId = Number(product.id_category);
    const category = await CategoryRepository.findByIdCategory(categoryId);
    if (!category) throw new ApiException('CATEGORY_NOT_FOUND', 404, categoryId);
    return await ProductRepository.createProduct(product);
  }

  async updateProduct(product: Products): Promise<[number]> {
    await this.findByIdProduct(product.id_product);
    this.validateData(product);
    return await ProductRepository.updateProduct(product);
  }

  async deleteProduct(id: number): Promise<number> {
    await this.findByIdProduct(id);
    return await ProductRepository.deleteProduct(id);
  }
}

export default new ProductService();
