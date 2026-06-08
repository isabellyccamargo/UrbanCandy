import { Button } from '../Button/Button';
import { useCart } from '../../hooks/UseCart';
import { toast } from 'react-toastify';
import './CardProduct.css';

export const CardProduct = ({ product, showDescription = false }) => {
  const baseImgUrl = 'http://localhost:3030/uploads/';
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);

    // Exibe a mensagem de sucesso
    toast.success(`${product.name} adicionado ao carrinho! 🛒`, {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  };

  return (
    <div className="product-card">
      <img src={`${baseImgUrl}${product.image}`} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3>{product.name}</h3>
        {showDescription && <p className="product-description">{product.description}</p>}

        <div className="product-footer">
          <p className="product-price">
            {Number(product.price).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>

          <Button onClick={handleAddToCart}>Adicionar</Button>
        </div>
      </div>
    </div>
  );
};
