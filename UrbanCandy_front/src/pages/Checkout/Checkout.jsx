import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../Hooks/UseCart';
import { createOrder, getUserProfile, getAllTypeOfPayment } from '../../services/Api';
import { Button } from '../../componentes/Button/Button';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const formatBRL = (val) =>
    Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    const userId = user?.id_people || user?.id_user || user?.id;

    if (!userId) {
      toast.info('Por favor, faça login para finalizar seu pedido. 🍬');
      return navigate('/');
    }

    (async () => {
      try {
        const [resProfile, resPayments] = await Promise.all([
          getUserProfile(userId),
          getAllTypeOfPayment(),
        ]);

        if (resProfile) {
          const person = resProfile.people || resProfile;
          const addr = person.address || person.Addresses?.[0] || {};
          setUserData({
            ...person,
            id_people: person.id_people || userId,
            email: resProfile.email || person.email,
            addressFull: addr.road
              ? `${addr.road}, ${addr.number || 'S/N'} - ${addr.neighborhood || ''}`
              : 'Endereço não cadastrado',
            cityState: addr.city ? `${addr.city} ` : 'Cidade não informada',
          });
        }
        setPaymentOptions(resPayments.data?.data || resPayments.data || []);
      } catch {
        toast.error('Erro ao carregar dados do checkout. 🌐');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const handleFinalizeOrder = async () => {
    if (!paymentMethod) return toast.warning('Selecione uma forma de pagamento! 💳');
    if (cart.items.length === 0) return toast.error('Seu carrinho está vazio!');

    setIsSubmitting(true);
    try {
      const orderPayload = {
        id_people: Number(userData.id_people),
        id_payment: Number(paymentMethod),
        cart: {
          total: Number(cart.total),
          items: cart.items.map((item) => ({
            id_product: Number(item.id_product),
            quantity: Number(item.quantity || 1),
            sub_total: Number(
              item.sub_total || Number(item.products?.price || 0) * Number(item.quantity || 1)
            ),
            products: {
              price: Number(item.products?.price || 0),
              name: item.products?.name || 'Produto',
            },
          })),
        },
      };

      await createOrder(orderPayload);
      clearCart();
      setShowSuccessModal(true);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erro ao processar pedido.';

      toast.error(`Falha: ${errorMsg}`);
      console.error('Detalhes do erro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Carregando dados... 🍬</div>;
  if (!userData) return null;

  return (
    <div className="checkout-container animate-entrance">
      <div className="checkout-content">
        <section className="checkout-section card-candy">
          <h3>
            <i className="fas fa-user"></i> Dados Pessoais
          </h3>
          <div className="info-grid">
            <p>
              <strong>Nome:</strong> {userData.name}
            </p>
            <p>
              <strong>CPF:</strong> {userData.cpf || 'Não informado'}
            </p>
            <p>
              <strong>Telefone:</strong> {userData.telephone || userData.phone || '---'}
            </p>
            <p>
              <strong>E-mail:</strong> {userData.email}
            </p>
          </div>
        </section>

        <section className="checkout-section card-candy">
          <h3>
            <i className="fas fa-truck"></i> Entrega
          </h3>
          <p className="address-text">{userData.addressFull}</p>
          <p className="city-text">{userData.cityState}</p>
        </section>

        <section className="checkout-section card-candy">
          <h3>
            <i className="fas fa-credit-card"></i> Pagamento
          </h3>
          <div className="payment-options">
            {paymentOptions.map((option) => (
              <label
                key={option.id_payment}
                className={`radio-label ${paymentMethod === option.id_payment ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === option.id_payment}
                  onChange={() => setPaymentMethod(option.id_payment)}
                />
                <span>{option.name_payment}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="checkout-summary card-candy">
        <h2>Resumo do pedido</h2>
        <div className="summary-items">
          {cart.items.map((item) => (
            <div key={item.id_product} className="summary-item">
              <img
                src={`http://localhost:3030/uploads/${item.products?.image}`}
                alt={item.products?.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/50';
                }}
              />
              <div className="item-details">
                <p>
                  {item.quantity}x {item.products?.name}
                </p>
                <span>{formatBRL(Number(item.products?.price || 0) * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="total-box">
          <span>Total a pagar</span>
          <strong>{formatBRL(cart.total)}</strong>
        </div>

        <Button
          onClick={handleFinalizeOrder}
          variant="primary"
          disabled={isSubmitting || cart.items.length === 0}
        >
          {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
      </aside>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-confirmacao success-modal">
            <div className="success-icon">🎉</div>
            <h3>Pedido Confirmado!</h3>
            <p>
              Obrigada pela preferência. Em breve seu pedido entrará em produção e será entregue!
            </p>
            <div className="modal-buttons">
              <Button variant="primary" onClick={() => navigate('/pedidos')}>
                Ver meus pedidos
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
