import { useCart } from '../../Hooks/UseCart';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../Button/Button';
import { useAuth } from '../../hooks/AuthContext';
import './CartModal.css';

export const CartModal = () => {
  const { setIsLoginModalOpen } = useAuth();
  const { cart, isCartOpen, setIsCartOpen, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const baseImgUrl = 'http://localhost:3030/uploads/';

  if (!isCartOpen) return null;

  const isCartEmpty = !cart.items || cart.items.length === 0;

  const handleCheckout = () => {
    const user = localStorage.getItem('@UrbanCandy:user');

    setIsCartOpen(false);

    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Carrinho</h2>
          <button onClick={() => setIsCartOpen(false)}>X</button>
        </div>

        <div className="cart-items">
          {isCartEmpty ? (
            <div className="empty-cart-view">
              <ShoppingBag size={100} color="#D1D5DB" strokeWidth={1.2} />
              <h3>Seu carrinho está vazio</h3>
              <p>Adicione produtos deliciosos!</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id_product} className="cart-item">
                <img src={`${baseImgUrl}${item.products.image}`} alt={item.products.name} />
                <div className="item-info">
                  <h4>{item.products.name}</h4>
                  <p>R$ {Number(item.products.price).toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.id_product, item.quantity - 1);
                        }
                      }}
                    >
                      -
                    </button>

                    <span className="qty-number">{item.quantity}</span>

                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id_product, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeItem(item.id_product)}>
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* O RODAPÉ SÓ APARECE SE TIVER ITENS */}
        {!isCartEmpty && (
          <div className="cart-footer">
            <div className="total-row">
              <span>Total do Pedido:</span>
              <span className="total-price">R$ {Number(cart.total).toFixed(2)}</span>
            </div>
            <Button onClick={handleCheckout} variant="primary">
              Fechar Pedido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
