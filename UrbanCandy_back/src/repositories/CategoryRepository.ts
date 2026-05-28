import Categories from '../models/Categories.js';

class CategoryRepository {
  async findAllCategory(limit: number, offset: number) {
    return await Categories.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['id_category', 'ASC']],
    });
  }

  async findByIdCategory(id_category: number) {
    return await Categories.findByPk(id_category);
  }

  async findByName(name_category: string) {
    return await Categories.findOne({
      where: { name_category: name_category },
    });
  }

  async createCategory(category: Categories) {
    return await category.save();
  }

  async updateCategory(idCategory: number, category: Categories) {
    return await Categories.update(
      {
        name_category: category.name_category,
      },
      {
        where: { id_category: idCategory },
      }
    );
  }

  async deleteCategory(id_category: number) {
    return await Categories.destroy({
      where: { id_category: id_category },
    });
  }
}

export default new CategoryRepository();
