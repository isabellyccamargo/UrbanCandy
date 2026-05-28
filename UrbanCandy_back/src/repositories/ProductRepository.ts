import Products from '../models/Products.js';
import Categories from '../models/Categories.js';

interface ProductQueryResult {
  rows: Products[];
  count: number;
}

class ProductRepository {
  async findAllProduct(limit: number, offset: number) {
    return await Products.findAndCountAll({
      limit: limit,
      offset: offset,
      include: [{ all: true }],
      order: [['id_product', 'ASC']],
    });
  }

  async findFeaturedProducts(limit: number, offset: number): Promise<ProductQueryResult> {
    return await Products.findAndCountAll({
      where: { featured: true },
      limit: limit,
      offset: offset,
      order: [['id_product', 'ASC']],
      include: [{ model: Categories, as: 'category' }],
    });
  }

  async findByIdProduct(id_product: number): Promise<Products | null> {
    return await Products.findByPk(id_product, {
      include: [{ model: Categories, as: 'category' }],
    });
  }

  async findByCategory(
    categoryName: string,
    limit: number,
    offset: number
  ): Promise<ProductQueryResult> {
    return await Products.findAndCountAll({
      limit,
      offset,
      order: [['id_product', 'ASC']],
      include: [
        {
          model: Categories,
          as: 'category',
          where: { name_category: categoryName },
        },
      ],
    });
  }

  async createProduct(product: Products): Promise<Products> {
    return await product.save();
  }

  async updateProduct(product: Products): Promise<[number]> {
    return await Products.update(
      {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        id_category: product.id_category,
        featured: product.featured,
      },
      {
        where: { id_product: product.id_product },
      }
    );
  }

  async deleteProduct(id_product: number): Promise<number> {
    return await Products.destroy({
      where: { id_product },
    });
  }
}

export default new ProductRepository();
