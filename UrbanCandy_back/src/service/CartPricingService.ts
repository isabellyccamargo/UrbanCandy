import { Op } from 'sequelize';
import { ApiException } from '../exception/ApiException.js';
import type { ICart, ICartItem } from '../@types/OrdersTypes.js';
import Products from '../models/Products.js';

export async function priceCart(cart: ICart): Promise<ICart> {
  if (!Array.isArray(cart?.items) || cart.items.length === 0) {
    throw new ApiException('CART_EMPTY', 400, 'Carrinho vazio.');
  }

  const quantities = new Map<number, number>();
  for (const item of cart.items) {
    const productId = Number(item.id_product);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(productId) || productId < 1) {
      throw new ApiException('INVALID_PRODUCT', 400, 'Um produto do carrinho é inválido.');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new ApiException('INVALID_QUANTITY', 400, 'A quantidade de um produto é inválida.');
    }
    const combinedQuantity = (quantities.get(productId) ?? 0) + quantity;
    if (combinedQuantity > 99) {
      throw new ApiException('INVALID_QUANTITY', 400, 'A quantidade máxima por produto é 99.');
    }
    quantities.set(productId, combinedQuantity);
  }

  const products = await Products.findAll({
    where: { id_product: { [Op.in]: [...quantities.keys()] } },
    attributes: ['id_product', 'name', 'price'],
  });
  if (products.length !== quantities.size) {
    throw new ApiException('PRODUCT_NOT_FOUND', 400, 'Um produto não está mais disponível.');
  }

  const items: ICartItem[] = products.map((product) => {
    const quantity = quantities.get(product.id_product);
    const price = Number(product.price);
    if (!quantity || !Number.isFinite(price) || price <= 0) {
      throw new ApiException('INVALID_PRODUCT_PRICE', 400, 'Um produto tem preço inválido.');
    }
    const unitPriceCents = Math.round(price * 100);
    return {
      id_product: product.id_product,
      quantity,
      sub_total: (unitPriceCents * quantity) / 100,
      products: { price: unitPriceCents / 100, name: product.name },
    };
  });
  const totalCents = items.reduce((sum, item) => sum + Math.round(item.sub_total * 100), 0);
  if (totalCents < 1) {
    throw new ApiException('INVALID_TOTAL', 400, 'O total do pedido é inválido.');
  }
  return { items, total: totalCents / 100 };
}
