import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ProdutoServico from '../src/service/ProductService.js';
import ProductRepository from '../src/repositories/ProductRepository.js';
import CategoryRepository from '../src/repositories/CategoryRepository.js';

describe('Produto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('deve lançar erro se o preço for zero ou negativo na criação', async () => {
    const p: any = { name: 'Erro', price: 0, id_category: 1 };
    await expect(ProdutoServico.createProduct(p)).rejects.toThrow('INVALID_PRODUCT_PRICE');
  });

  it('deve criar produto se categoria existir e dados forem válidos', async () => {
    const p: any = { name: 'Cadeira', price: 100, id_category: 1 };
    jest.spyOn(CategoryRepository, 'findByIdCategory').mockResolvedValue({ id_category: 1 } as any);
    jest
      .spyOn(ProductRepository, 'createProduct')
      .mockResolvedValue({ id_product: 50, ...p } as any);

    const res = await ProdutoServico.createProduct(p);
    expect(res).toHaveProperty('id_product', 50);
  });

  it('deve formatar o nome da categoria corretamente ao buscar por categoria', async () => {
    const spy = jest
      .spyOn(ProductRepository, 'findByCategory')
      .mockResolvedValue({ count: 1, rows: [] } as any);

    await ProdutoServico.findByCategory('GAMES', 1, 10);

    expect(spy).toHaveBeenCalledWith('Games', 10, 0);
  });

  it('deve lançar erro ao buscar por ID se o produto não existir', async () => {
    jest.spyOn(ProductRepository, 'findByIdProduct').mockResolvedValue(null);

    await expect(ProdutoServico.findByIdProduct(999)).rejects.toThrow('PRODUCT_NOT_FOUND');
  });

  it('deve validar os dados antes de atualizar um produto', async () => {
    const p: any = { id_product: 1, name: '', price: 100 };

    jest.spyOn(ProductRepository, 'findByIdProduct').mockResolvedValue({ id_product: 1 } as any);

    await expect(ProdutoServico.updateProduct(p)).rejects.toThrow('INVALID_PRODUCT_NAME');
  });

  it('deve atualizar com sucesso quando o produto existe e dados são válidos', async () => {
    const p: any = { id_product: 1, name: 'Editado', price: 50, id_category: 1 };

    jest.spyOn(ProductRepository, 'findByIdProduct').mockResolvedValue(p);
    const spyUpdate = jest.spyOn(ProductRepository, 'updateProduct').mockResolvedValue([1] as any);

    await ProdutoServico.updateProduct(p);
    expect(spyUpdate).toHaveBeenCalled();
  });

  it('deve lançar erro ao tentar deletar produto inexistente', async () => {
    jest.spyOn(ProductRepository, 'findByIdProduct').mockResolvedValue(null);

    await expect(ProdutoServico.deleteProduct(1)).rejects.toThrow('PRODUCT_NOT_FOUND');
  });

  it('deve chamar o repositório de deleção se o produto existir', async () => {
    jest.spyOn(ProductRepository, 'findByIdProduct').mockResolvedValue({ id_product: 1 } as any);
    const spyDel = jest.spyOn(ProductRepository, 'deleteProduct').mockResolvedValue(1 as any);

    await ProdutoServico.deleteProduct(1);
    expect(spyDel).toHaveBeenCalledWith(1);
  });
});
