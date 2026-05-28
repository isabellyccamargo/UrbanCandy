import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import CategoryService from '../src/service/CategoryService.js';
import CategoryRepository from '../src/repositories/CategoryRepository.js';

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Create', () => {
    it('deve lançar erro se o nome da categoria estiver vazio', async () => {
      const catInvalida: any = { name_category: '' };

      await expect(CategoryService.createCategory(catInvalida)).rejects.toThrow(
        'INVALID_CATEGORY_NAME'
      );
    });

    it('deve impedir a criação de categorias com nomes duplicados', async () => {
      const cat: any = { name_category: 'Doces' };

      jest
        .spyOn(CategoryRepository, 'findByName')
        .mockResolvedValue({ id_category: 1, name_category: 'Doces' } as any);

      await expect(CategoryService.createCategory(cat)).rejects.toThrow('CATEGORY_ALREADY_EXISTS');
    });

    it('deve criar uma categoria com sucesso se o nome for novo', async () => {
      const cat: any = { name_category: 'Bebidas' };

      jest.spyOn(CategoryRepository, 'findByName').mockResolvedValue(null);
      const spyCreate = jest
        .spyOn(CategoryRepository, 'createCategory')
        .mockResolvedValue({ id_category: 2, ...cat } as any);

      const result = await CategoryService.createCategory(cat);
      expect(result.id_category).toBe(2);
      expect(spyCreate).toHaveBeenCalled();
    });
  });

  describe('Read/Delete', () => {
    it('deve lançar erro ao buscar uma categoria que não existe', async () => {
      jest.spyOn(CategoryRepository, 'findByIdCategory').mockResolvedValue(null);

      await expect(CategoryService.findByIdCategory(999)).rejects.toThrow(
        /CATEGORY_NOT_FOUND|não existe/
      );
    });

    it('deve permitir deletar se a categoria existir', async () => {
      jest
        .spyOn(CategoryRepository, 'findByIdCategory')
        .mockResolvedValue({ id_category: 1 } as any);
      const spyDel = jest.spyOn(CategoryRepository, 'deleteCategory').mockResolvedValue(1 as any);

      await CategoryService.deleteCategory(1);
      expect(spyDel).toHaveBeenCalledWith(1);
    });
  });

  describe('Update', () => {
    it('deve permitir atualizar se o nome for alterado para um que não existe', async () => {
      const catUpdate: any = { name_category: 'Nova Categoria' };

      jest
        .spyOn(CategoryRepository, 'findByIdCategory')
        .mockResolvedValue({ id_category: 1 } as any);
      jest.spyOn(CategoryRepository, 'findByName').mockResolvedValue(null);
      const spyUpdate = jest
        .spyOn(CategoryRepository, 'updateCategory')
        .mockResolvedValue([1] as any);

      await CategoryService.updateCategory(1, catUpdate);
      expect(spyUpdate).toHaveBeenCalled();
    });

    it('não deve dar erro de nome duplicado se o nome pertencer à própria categoria que está sendo editada', async () => {
      const catMesmoNome: any = { name_category: 'Doces' };

      jest
        .spyOn(CategoryRepository, 'findByIdCategory')
        .mockResolvedValue({ id_category: 1 } as any);

      jest
        .spyOn(CategoryRepository, 'findByName')
        .mockResolvedValue({ id_category: 1, name_category: 'Doces' } as any);

      const spyUpdate = jest
        .spyOn(CategoryRepository, 'updateCategory')
        .mockResolvedValue([1] as any);

      await CategoryService.updateCategory(1, catMesmoNome);
      expect(spyUpdate).toHaveBeenCalled();
    });
  });
});
