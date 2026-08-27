import Offers from '../models/Offers.js';
import OfferProducts from '../models/OfferProducts.js';
import Products from '../models/Products.js';

class OfferRepository {
  async findActiveOffers() {
    return await Offers.findAll({
      where: {
        active: true,
      },

      include: [
        {
          model: OfferProducts,
          as: 'products',
          include: [
            {
              model: Products,
              as: 'product',
              attributes: [
                'id_product',
                'name',
                'description',
                'price',
                'image',
              ],
            },
          ],
        },
      ],

      order: [['id_offer', 'DESC']],
    });
  }

  async findByIdOffer(id_offer: number) {
    return await Offers.findByPk(id_offer, {
      include: [
        {
          model: OfferProducts,
          as: 'products',
          include: [
            {
              model: Products,
              as: 'product',
              attributes: [
                'id_product',
                'name',
                'description',
                'price',
                'image',
              ],
            },
          ],
        },
      ],
    });
  }

  async createOffer(offer: Offers) {
    return await Offers.create(offer);
  }

  async updateOffer(offer: Offers) {
    return await Offers.update(offer, {
      where: {
        id_offer: offer.id_offer,
      },
    });
  }

  async deleteOffer(id_offer: number) {
    return await Offers.destroy({
      where: {
        id_offer,
      },
    });
  }
}

export default new OfferRepository();