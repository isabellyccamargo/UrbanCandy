import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../../hooks/UseCart';
import { getAllOffers } from '../../services/Api';
import './OfferSection.css';

const getOfferImage = (image) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const uploadsOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : window.location.origin;
  return `${uploadsOrigin}/uploads/${image.replace(/^\/?uploads\//, '')}`;
};

const OfferSection = () => {
  const { addToCart } = useCart();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOffers = async () => {
      try {
        const response = await getAllOffers();
        const data = response.data?.data;
        if (!Array.isArray(data)) {
          throw new Error('Formato inválido ao carregar as ofertas.');
        }

        if (active) {
          setOffers(data.filter((offer) => offer.active && Array.isArray(offer.products)));
        }
      } catch (error) {
        console.error('Erro ao carregar ofertas:', error);
        toast.error('Não foi possível carregar as ofertas. Tente novamente mais tarde.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadOffers();
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = (offer) => {
    const firstProduct = offer.products.find((item) => item.product)?.product;
    if (!firstProduct) {
      toast.error('Esta oferta está indisponível no momento.');
      return;
    }

    addToCart({
      id_product: Number(firstProduct.id_product),
      id_offer: Number(offer.id_offer),
      isOffer: true,
      name: offer.name_offer,
      price: Number(offer.price_offer),
      image: offer.image || firstProduct.image,
    });
    toast.success(`${offer.name_offer} adicionada ao carrinho! 🛒`);
  };

  if (loading || offers.length === 0) return null;

  return (
    <section className="home-offers-section" aria-labelledby="home-offers-title">
      <header className="home-offers-header">
        <span className="home-offers-eyebrow">Aproveite e economize</span>
        <h2 id="home-offers-title">Ofertas Especiais</h2>
        <p>Combinações deliciosas por um preço especial.</p>
      </header>

      <div className="home-offers-list">
        {offers.map((offer) => {
          const products = offer.products
            .map((item) => item.product?.name)
            .filter(Boolean);

          return (
            <article className="home-offer-card" key={offer.id_offer}>
              <div className="home-offer-image-wrap">
                {offer.image ? (
                  <img
                    className="home-offer-image"
                    src={getOfferImage(offer.image)}
                    alt={offer.name_offer}
                  />
                ) : (
                  <div className="home-offer-image-placeholder" aria-hidden="true">
                    🍬
                  </div>
                )}
                <span className="home-offer-badge">Oferta</span>
              </div>

              <div className="home-offer-content">
                <div>
                  <h3>{offer.name_offer}</h3>
                  {offer.description && <p className="home-offer-description">{offer.description}</p>}
                  {products.length > 0 && (
                    <p className="home-offer-products">Inclui: {products.join(' + ')}</p>
                  )}
                </div>

                <div className="home-offer-footer">
                  <strong>
                    {Number(offer.price_offer).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </strong>
                  <button type="button" onClick={() => handleAddToCart(offer)}>
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default OfferSection;
