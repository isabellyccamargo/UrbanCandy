import { Op } from 'sequelize';
import { ApiException } from '../exception/ApiException.js';
import type { ICart, ICartItem } from '../@types/OrdersTypes.js';
import Products from '../models/Products.js';
import Offers from '../models/Offers.js';
import OfferProducts from '../models/OfferProducts.js';

export async function priceCart(cart: ICart): Promise<ICart> {
  if (!Array.isArray(cart?.items) || !Array.isArray(cart.offers ?? [])) {
    throw new ApiException('INVALID_CART', 400, 'Os itens do carrinho são inválidos.');
  }
  const offerRequests = cart.offers ?? [];
  if (cart.items.length === 0 && offerRequests.length === 0) {
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

  const offerQuantities = new Map<number, number>();
  for (const offerItem of offerRequests) {
    const offerId = Number(offerItem?.id_offer);
    const quantity = Number(offerItem?.quantity);
    if (!Number.isInteger(offerId) || offerId < 1) {
      throw new ApiException('INVALID_OFFER', 400, 'Uma oferta do carrinho é inválida.');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new ApiException('INVALID_QUANTITY', 400, 'A quantidade de uma oferta é inválida.');
    }
    const combinedQuantity = (offerQuantities.get(offerId) ?? 0) + quantity;
    if (combinedQuantity > 99) {
      throw new ApiException('INVALID_QUANTITY', 400, 'A quantidade máxima por oferta é 99.');
    }
    offerQuantities.set(offerId, combinedQuantity);
  }

  const offers = offerQuantities.size
    ? await Offers.findAll({
      where: { id_offer: { [Op.in]: [...offerQuantities.keys()] }, active: true },
    })
    : [];
  if (offers.length !== offerQuantities.size) {
    throw new ApiException('OFFER_NOT_FOUND', 400, 'Uma oferta não está mais disponível.');
  }

  const offerProducts = offerQuantities.size
    ? await OfferProducts.findAll({
      where: { id_offer: { [Op.in]: [...offerQuantities.keys()] } },
      attributes: ['id_offer', 'id_product', 'quantity'],
    })
    : [];
  const productIds = new Set(quantities.keys());
  offerProducts.forEach((item) => productIds.add(Number(item.id_product)));

  const products = productIds.size
    ? await Products.findAll({
      where: { id_product: { [Op.in]: [...productIds] } },
      attributes: ['id_product', 'name', 'price'],
    })
    : [];
  if (products.length !== productIds.size) {
    throw new ApiException('PRODUCT_NOT_FOUND', 400, 'Um produto não está mais disponível.');
  }
  const productsById = new Map(products.map((product) => [Number(product.id_product), product]));

  const items: ICartItem[] = products.flatMap((product): ICartItem[] => {
    const quantity = quantities.get(Number(product.id_product));
    if (!quantity) return [];
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new ApiException('INVALID_PRODUCT_PRICE', 400, 'Um produto tem preço inválido.');
    }
    const unitPriceCents = Math.round(price * 100);
    return [
      {
        id_product: product.id_product,
        quantity,
        sub_total: (unitPriceCents * quantity) / 100,
        products: { price: unitPriceCents / 100, name: product.name },
      },
    ];
  });

  const offersById = new Map(offers.map((offer) => [Number(offer.id_offer), offer]));
  for (const [offerId, offerQuantity] of offerQuantities) {
    const offer = offersById.get(offerId);
    const offerProductRows = offerProducts.filter((item) => Number(item.id_offer) === offerId);
    const units = offerProductRows.flatMap((item) => {
      const product = productsById.get(Number(item.id_product));
      const productQuantity = Number(item.quantity);
      if (!product || !Number.isInteger(productQuantity) || productQuantity < 1) {
        throw new ApiException(
          'INVALID_OFFER_PRODUCTS',
          400,
          'Os produtos da oferta são inválidos.'
        );
      }
      const priceCents = Math.round(Number(product.price) * 100);
      if (!Number.isFinite(priceCents) || priceCents < 1) {
        throw new ApiException(
          'INVALID_PRODUCT_PRICE',
          400,
          'Um produto da oferta tem preço inválido.'
        );
      }
      return Array.from({ length: productQuantity }, () => ({ product, priceCents }));
    });

    const offerPriceCents = Math.round(Number(offer?.price_offer) * 100);
    if (
      !offer ||
      units.length === 0 ||
      !Number.isFinite(offerPriceCents) ||
      offerPriceCents < units.length
    ) {
      throw new ApiException(
        'INVALID_OFFER_PRICE',
        400,
        'O preço ou os produtos da oferta são inválidos.'
      );
    }

    const basePriceCents = units.reduce((sum, unit) => sum + unit.priceCents, 0);
    for (let occurrence = 0; occurrence < offerQuantity; occurrence += 1) {
      const distributableCents = offerPriceCents - units.length;
      const allocations = units.map((unit) => {
        const proportionalCents = (distributableCents * unit.priceCents) / basePriceCents;
        const cents = Math.floor(proportionalCents);
        return { cents, remainder: proportionalCents - cents };
      });
      const remainingCents =
        distributableCents - allocations.reduce((sum, item) => sum + item.cents, 0);
      [...allocations]
        .sort((left, right) => right.remainder - left.remainder)
        .slice(0, remainingCents)
        .forEach((allocation) => {
          allocation.cents += 1;
        });

      allocations.forEach((allocation, index) => {
        const unit = units[index];
        if (!unit) {
          throw new ApiException(
            'INVALID_OFFER_PRODUCTS',
            400,
            'Os produtos da oferta são inválidos.'
          );
        }
        const price = (allocation.cents + 1) / 100;
        items.push({
          id_product: Number(unit.product.id_product),
          quantity: 1,
          sub_total: price,
          products: { price, name: unit.product.name },
        });
      });
    }
  }

  const finalQuantities = new Map<number, number>();
  items.forEach((item) => {
    const combinedQuantity = (finalQuantities.get(item.id_product) ?? 0) + item.quantity;
    if (combinedQuantity > 99) {
      throw new ApiException('INVALID_QUANTITY', 400, 'A quantidade máxima por produto é 99.');
    }
    finalQuantities.set(item.id_product, combinedQuantity);
  });

  const totalCents = items.reduce((sum, item) => sum + Math.round(item.sub_total * 100), 0);
  if (totalCents < 1) {
    throw new ApiException('INVALID_TOTAL', 400, 'O total do pedido é inválido.');
  }
  return { items, total: totalCents / 100 };
}
