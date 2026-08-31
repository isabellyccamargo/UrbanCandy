import OfferRepository from '../repositories/OfferRepository.js';
import OfferProducts from '../models/OfferProducts.js';
import Offers from '../models/Offers.js';
import ProductRepository from '../repositories/ProductRepository.js';
import { ApiException } from '../exception/ApiException.js';

class OfferService {
  async findActiveOffers() {
    return await OfferRepository.findActiveOffers();
  }

  async findByIdOffer(id_offer: number) {
    const offer = await OfferRepository.findByIdOffer(id_offer);

    if (!offer) {
      throw new ApiException(
        'OFFER_NOT_FOUND',
        404,
        id_offer
      );
    }

    return offer;
  }

  async createOffer(
    offer: Offers,
    productIds: number[]
  ) {
    if (!offer.name_offer?.trim()) {
      throw new ApiException(
        'INVALID_OFFER_NAME',
        400
      );
    }

    if (offer.price_offer <= 0) {
      throw new ApiException(
        'INVALID_OFFER_PRICE',
        400
      );
    }

    if (!productIds || productIds.length < 1 || productIds.length > 2) {
      throw new ApiException(
        'INVALID_OFFER_PRODUCTS',
        400
      );
    }

    // Verifica se os produtos realmente existem
    for (const id_product of productIds) {
      const product =
        await ProductRepository.findByIdProduct(id_product);

      if (!product) {
        throw new ApiException(
          'PRODUCT_NOT_FOUND',
          404,
          id_product
        );
      }
    }

    const createdOffer =
      await OfferRepository.createOffer(offer);

    // Cria os vínculos da oferta com os produtos
    for (const id_product of productIds) {
      await OfferProducts.create({
        id_offer: createdOffer.id_offer,
        id_product,
        quantity: 1,
      });
    }

    return await OfferRepository.findByIdOffer(
      createdOffer.id_offer
    );
  }

  async updateOffer(
    offer: Offers,
    productIds?: number[]
  ) {
    await this.findByIdOffer(offer.id_offer);

    if (!offer.name_offer?.trim()) {
      throw new ApiException(
        'INVALID_OFFER_NAME',
        400
      );
    }

    if (offer.price_offer <= 0) {
      throw new ApiException(
        'INVALID_OFFER_PRICE',
        400
      );
    }

    if (productIds) {
      if (
        productIds.length < 1 ||
        productIds.length > 2
      ) {
        throw new ApiException(
          'INVALID_OFFER_PRODUCTS',
          400
        );
      }

      for (const id_product of productIds) {
        const product =
          await ProductRepository.findByIdProduct(id_product);

        if (!product) {
          throw new ApiException(
            'PRODUCT_NOT_FOUND',
            404,
            id_product
          );
        }
      }

      // Remove os produtos antigos
      await OfferProducts.destroy({
        where: {
          id_offer: offer.id_offer,
        },
      });

      // Adiciona os novos
      for (const id_product of productIds) {
        await OfferProducts.create({
          id_offer: offer.id_offer,
          id_product,
          quantity: 1,
        });
      }
    }

    await OfferRepository.updateOffer(offer);

    return await OfferRepository.findByIdOffer(
      offer.id_offer
    );
  }

  async deleteOffer(id_offer: number) {
    await this.findByIdOffer(id_offer);

    await OfferProducts.destroy({
      where: {
        id_offer,
      },
    });

    return await OfferRepository.deleteOffer(id_offer);
  }
}

export default new OfferService();