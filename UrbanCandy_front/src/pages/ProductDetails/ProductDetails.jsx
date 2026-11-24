import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../componentes/Button/Button';
import { useCart } from '../../hooks/UseCart';
import { getProductById } from '../../services/Api';
import './ProductDetails.css';

const getProductData = (response) => response.data?.data || response.data;

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await getProductById(id);
        if (active) setProduct(getProductData(response));
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <main className="product-details-state">Carregando produto...</main>;
  }

  if (error || !product) {
    return (
      <main className="product-details-state" role="alert">
        Não foi possível carregar os detalhes deste produto.
      </main>
    );
  }

  const imageBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  const imageUrl = product.image
    ? `${imageBaseUrl}/uploads/${product.image}`
    : null;
  const ingredients = String(product.ingredients || '')
    .split(';')
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} adicionado ao carrinho! 🛒`);
  };

  return (
    <main className="product-details-page">
      <section className="product-details-card">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="product-details-image" />
        ) : (
          <div className="product-details-image-placeholder">Sem imagem</div>
        )}
        <div className="product-details-info">
          <p className="product-details-eyebrow">Detalhes do produto</p>
          <h1>{product.name}</h1>
          <p className="product-details-price">
            {Number(product.price).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
          <h2>Descrição</h2>
          <p className="product-details-description">{product.description}</p>
          <h2>Ingredientes</h2>
          {ingredients.length ? (
            <ul className="product-ingredients">
              {ingredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p className="product-details-description">Ingredientes não informados.</p>
          )}
          <Button onClick={handleAddToCart}>Adicionar ao carrinho</Button>
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;
