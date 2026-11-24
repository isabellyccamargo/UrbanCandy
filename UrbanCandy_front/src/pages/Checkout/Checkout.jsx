import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/UseCart';
import {
  createOrder,
  confirmDemoPixPayment,
  getUserProfile,
  getAllTypeOfPayment,
  getAllDeliveryTypes,
  createPaymentCheckout,
  getPaymentCheckoutStatus,
  getEmailVerificationStatus,
} from '../../services/Api';
import { Button } from '../../componentes/Button/Button';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/AuthContext';
import { Banknote, Clock3, QrCode, Store, Truck, WalletCards } from 'lucide-react';
import './Checkout.css';

const PIX_DEMO_DURATION_SECONDS = 5 * 60;

const getPaymentMethodKind = (name) => {
  const normalizedName = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalizedName.includes('pix')) return 'pix';
  if (normalizedName.includes('dinheiro') || normalizedName.includes('cash')) return 'cash';
  return 'online';
};

const isPixDemoEnabled = import.meta.env.DEV;

const isDemoQrCellFilled = (row, column) => {
  const finder = (startRow, startColumn) => {
    const localRow = row - startRow;
    const localColumn = column - startColumn;
    if (localRow < 0 || localRow > 6 || localColumn < 0 || localColumn > 6) return null;
    return (
      localRow === 0 ||
      localRow === 6 ||
      localColumn === 0 ||
      localColumn === 6 ||
      (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4)
    );
  };
  const finderCell = finder(0, 0) ?? finder(0, 18) ?? finder(18, 0);

  return finderCell ?? (row * 17 + column * 31 + row * column * 7) % 11 < 5;
};

const DemoPixQr = () => (
  <svg
    className="pix-demo-qr"
    viewBox="0 0 25 25"
    role="img"
    aria-label="QR ilustrativo, não pagável"
  >
    <rect width="25" height="25" fill="#fff" />
    {Array.from({ length: 25 }, (_, row) =>
      Array.from({ length: 25 }, (_, column) =>
        isDemoQrCellFilled(row, column) ? (
          <rect key={`${row}-${column}`} x={column} y={row} width="1" height="1" fill="#222" />
        ) : null
      )
    )}
  </svg>
);

const createCartPayload = (cart) => ({
  total: Number(cart.total),
  items: cart.items
    .filter((item) => !item.isOffer)
    .map((item) => ({
      id_product: Number(item.id_product),
      quantity: Number(item.quantity || 1),
    })),
  offers: cart.items
    .filter((item) => item.isOffer)
    .map((item) => ({
      id_offer: Number(item.id_offer),
      quantity: Number(item.quantity || 1),
    })),
});

const getDeliveryDetails = (name) => {
  const normalizedName = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return normalizedName.includes('retirada') || normalizedName.includes('pickup')
    ? { icon: Store, description: 'Retire seu pedido no local.' }
    : { icon: Truck, description: 'Receba seu pedido no endereço cadastrado.' };
};

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [deliveryId, setDeliveryId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emailVerified, setEmailVerified] = useState(null);
  const [activeCheckout, setActiveCheckout] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [checkoutPopupBlocked, setCheckoutPopupBlocked] = useState(false);
  const [pixDemoState, setPixDemoState] = useState('idle');
  const [pixDemoPaid, setPixDemoPaid] = useState(false);
  const [pixDemoOrderId, setPixDemoOrderId] = useState(null);
  const [pixDemoExpiresAt, setPixDemoExpiresAt] = useState(null);
  const [pixDemoSecondsRemaining, setPixDemoSecondsRemaining] = useState(PIX_DEMO_DURATION_SECONDS);
  const completionHandled = useRef(false);
  const checkoutStatusRef = useRef(null);
  const pixDemoRef = useRef(null);

  const formatBRL = (val) =>
    Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    if (checkoutPopupBlocked) {
      checkoutStatusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [checkoutPopupBlocked]);

  useEffect(() => {
    if (pixDemoState !== 'waiting' || !pixDemoExpiresAt) return undefined;

    const updateCountdown = () => {
      const secondsRemaining = Math.max(0, Math.ceil((pixDemoExpiresAt - Date.now()) / 1000));
      setPixDemoSecondsRemaining(secondsRemaining);
      if (secondsRemaining === 0) setPixDemoState('expired');
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [pixDemoState, pixDemoExpiresAt]);

  useEffect(() => {
    if (pixDemoState !== 'idle') {
      pixDemoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [pixDemoState]);

  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id_people || user?.id_user || user?.id;

    if (!userId) {
      toast.info('Por favor, faça login para finalizar seu pedido. 🍬');
      return navigate('/');
    }

    (async () => {
      try {
        const [resProfile, resPayments, resDeliveryTypes] = await Promise.all([
          getUserProfile(userId),
          getAllTypeOfPayment(),
          getAllDeliveryTypes(),
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
        try {
          const verification = await getEmailVerificationStatus();
          const currentUserId = user?.id_user || user?.id;
          setEmailVerified(
            verification.verified &&
              (verification.userId == null || Number(verification.userId) === Number(currentUserId))
          );
        } catch (verificationError) {
          console.warn('Não foi possível consultar a confirmação do e-mail:', verificationError);
        }
        setPaymentOptions(resPayments.data?.data || resPayments.data || []);
        setDeliveryOptions(resDeliveryTypes.data?.data || resDeliveryTypes.data || []);
      } catch {
        toast.error('Erro ao carregar dados do checkout. 🌐');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!activeCheckout) return undefined;

    let active = true;
    let requestInProgress = false;
    let interval;

    const refreshStatus = async () => {
      if (requestInProgress) return;
      requestInProgress = true;
      try {
        const status = await getPaymentCheckoutStatus(activeCheckout.attemptId);
        if (!active) return;
        setCheckoutStatus(status);
        if (status.status !== 'pending') clearInterval(interval);
        if (status.status === 'approved' && !completionHandled.current) {
          completionHandled.current = true;
          clearCart();
        }
      } catch (statusError) {
        console.error('Não foi possível consultar o pagamento:', statusError);
      } finally {
        requestInProgress = false;
      }
    };

    const initialCheck = setTimeout(() => void refreshStatus(), 0);
    interval = setInterval(() => void refreshStatus(), 5000);
    return () => {
      active = false;
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [activeCheckout, clearCart]);

  const handleFinalizeOrder = async () => {
    if (!deliveryId) return toast.warning('Selecione um tipo de entrega ou retirada.');
    if (!selectedPayment) return toast.warning('Selecione uma forma de pagamento! 💳');
    if (cart.items.length === 0) return toast.error('Seu carrinho está vazio!');

    if (isPixDemoEnabled && getPaymentMethodKind(selectedPayment.name_payment) === 'pix') {
      setPixDemoPaid(false);
      setPixDemoOrderId(null);
      setPixDemoExpiresAt(Date.now() + PIX_DEMO_DURATION_SECONDS * 1000);
      setPixDemoSecondsRemaining(PIX_DEMO_DURATION_SECONDS);
      setPixDemoState('waiting');
      return;
    }

    const cartPayload = createCartPayload(cart);

    let checkoutWindow = null;
    setIsSubmitting(true);
    try {
      if (getPaymentMethodKind(selectedPayment.name_payment) === 'cash') {
        await createOrder({
          id_payment: Number(selectedPayment.id_payment),
          id_type_delivery: Number(deliveryId),
          cart: cartPayload,
        });
        clearCart();
        setShowSuccessModal(true);
      } else {
        if (activeCheckout && checkoutStatus?.status === 'pending') return;

        setCheckoutPopupBlocked(false);
        checkoutWindow = window.open('about:blank', '_blank');
        if (checkoutWindow) {
          checkoutWindow.opener = null;
          checkoutWindow.document.title = 'Pagamento seguro';
          checkoutWindow.document.body.textContent = 'Abrindo o checkout seguro do Mercado Pago...';
        }

        const checkout = await createPaymentCheckout({
          id_payment: 0,
          id_type_delivery: Number(deliveryId),
          payment_method: 'both',
          cart: cartPayload,
        });
        setActiveCheckout({
          attemptId: checkout.attemptId,
          checkoutUrl: checkout.checkoutUrl,
        });
        setCheckoutStatus({
          id: checkout.attemptId,
          status: 'pending',
          id_order: null,
          total: checkout.total,
        });
        completionHandled.current = false;
        let popupAvailable = Boolean(checkoutWindow);
        if (checkoutWindow) {
          try {
            checkoutWindow.location.replace(checkout.checkoutUrl);
          } catch (error) {
            popupAvailable = false;
            checkoutWindow.close();
            console.warn('Não foi possível redirecionar a nova aba para o pagamento:', error);
          }
        }
        setCheckoutPopupBlocked(!popupAvailable);
        if (!popupAvailable) {
          toast.info(
            'Seu navegador bloqueou a nova aba. Use o botão para continuar no Mercado Pago.'
          );
        }
      }
    } catch (error) {
      checkoutWindow?.close();
      if ((error.code || error.response?.data?.code) === 'EMAIL_NOT_VERIFIED') {
        setEmailVerified(false);
        toast.error(error.response?.data?.message || error.message);
        return navigate('/perfil');
      }
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

  const handleConfirmDemoPixPayment = async () => {
    if (!deliveryId) return toast.warning('Selecione um tipo de entrega ou retirada.');
    if (cart.items.length === 0) return toast.error('Seu carrinho está vazio!');

    setIsSubmitting(true);
    try {
      const result = await confirmDemoPixPayment({
        id_type_delivery: Number(deliveryId),
        cart: createCartPayload(cart),
      });
      setPixDemoPaid(true);
      setPixDemoOrderId(result.orderId);
      setPixDemoState('idle');
      clearCart();
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Não foi possível concluir a demonstração do Pix.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) return <div className="loading-screen">Carregando dados... 🍬</div>;
  if (!userData) return null;

  const selectedDelivery = deliveryOptions.find(
    (option) => Number(option.id_type_delivery) === Number(deliveryId)
  );
  const isPickup = /retirada|pickup/i.test(selectedDelivery?.name || '');
  const cashPayment = paymentOptions.find(
    (option) => getPaymentMethodKind(option.name_payment) === 'cash'
  );
  const availablePaymentOptions = [
    ...(cashPayment ? [cashPayment] : []),
    ...(isPixDemoEnabled ? [{ id_payment: -1, name_payment: 'Pix (demonstração)' }] : []),
    { id_payment: 0, name_payment: 'Mercado Pago' },
  ];
  const isPixDemo = selectedPayment && getPaymentMethodKind(selectedPayment.name_payment) === 'pix';
  const formatCountdown = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="checkout-container animate-entrance">
      <div className="checkout-content">
        {emailVerified === false && (
          <section className="checkout-section card-candy" role="alert">
            <h3>Confirme seu e-mail para continuar</h3>
            <p>
              A confirmação é necessária para receber atualizações importantes sobre a preparação e
              entrega do seu pedido.
            </p>
            <Button variant="primary" onClick={() => navigate('/perfil')}>
              Validar e-mail
            </Button>
          </section>
        )}
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
            <i className="fas fa-truck"></i> Como deseja receber? *
          </h3>
          <div
            className="delivery-options"
            role="radiogroup"
            aria-label="Tipo de entrega"
            aria-required="true"
          >
            {deliveryOptions.map((option) => (
              <label
                key={option.id_type_delivery}
                className={`radio-label ${
                  Number(deliveryId) === Number(option.id_type_delivery) ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option.id_type_delivery}
                  checked={Number(deliveryId) === Number(option.id_type_delivery)}
                  onChange={() => setDeliveryId(String(option.id_type_delivery))}
                />
                {(() => {
                  const { icon: Icon, description } = getDeliveryDetails(option.name);
                  return (
                    <>
                      <Icon className="checkout-option-icon" size={22} aria-hidden="true" />
                      <span className="checkout-option-copy">
                        <span className="checkout-option-title">{option.name}</span>
                        <span className="checkout-option-description">{description}</span>
                      </span>
                    </>
                  );
                })()}
              </label>
            ))}
          </div>
        </section>

        <section className="checkout-section card-candy">
          <h3>
            <i className="fas fa-map-marker-alt"></i>{' '}
            {isPickup ? 'Retirada no local' : 'Endereço de entrega'}
          </h3>
          {isPickup ? (
            <p>Seu pedido estará disponível para retirada no local.</p>
          ) : (
            <>
              <p className="address-text">{userData.addressFull}</p>
              <p className="city-text">{userData.cityState}</p>
            </>
          )}
        </section>

        <section className="checkout-section card-candy">
          <h3>
            <i className="fas fa-credit-card"></i> Selecione a forma de pagamento *
          </h3>
          <div
            className="payment-options"
            role="radiogroup"
            aria-label="Forma de pagamento"
            aria-required="true"
          >
            {availablePaymentOptions.map((option) => (
              <label
                key={option.id_payment}
                className={`radio-label ${
                  selectedPayment?.id_payment === option.id_payment ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.id_payment}
                  checked={selectedPayment?.id_payment === option.id_payment}
                  onChange={() => {
                    setSelectedPayment(option);
                    setPixDemoState('idle');
                  }}
                />
                {(() => {
                  const isCash = getPaymentMethodKind(option.name_payment) === 'cash';
                  const isPixOption = getPaymentMethodKind(option.name_payment) === 'pix';
                  const Icon = isCash ? Banknote : isPixOption ? QrCode : WalletCards;
                  return (
                    <>
                      <Icon className="checkout-option-icon" size={22} aria-hidden="true" />
                      <span className="checkout-option-copy">
                        <span className="checkout-option-title">
                          {isCash
                            ? 'Dinheiro'
                            : isPixOption
                              ? 'Pix (demonstração)'
                              : 'Pagar com Mercado Pago'}
                        </span>
                        <span className="checkout-option-description">
                          {isCash
                            ? 'Pagamento na entrega ou retirada.'
                            : isPixOption
                              ? 'Apenas demonstração visual; não gera cobrança Pix.'
                              : 'Cartão de crédito ou débito no checkout seguro.'}
                        </span>
                      </span>
                    </>
                  );
                })()}
              </label>
            ))}
          </div>
        </section>
        {pixDemoState !== 'idle' && (
          <section
            ref={pixDemoRef}
            className="checkout-section checkout-pix-demo"
            aria-live="polite"
          >
            <h3>
              <QrCode size={22} aria-hidden="true" />
              Pix de demonstração
            </h3>
            {pixDemoState === 'waiting' ? (
              <>
                <p className="pix-demo-warning">
                  Este QR é apenas ilustrativo e não pode ser pago. Nenhuma transferência real será
                  feita.
                </p>
                <div className="pix-demo-content">
                  <DemoPixQr />
                  <div className="pix-demo-details">
                    <strong>{formatBRL(cart.total)}</strong>
                    <span className="pix-demo-countdown">
                      <Clock3 size={18} aria-hidden="true" />
                      Expira em {formatCountdown(pixDemoSecondsRemaining)}
                    </span>
                    <p>Simulação local. Nenhuma comunicação com o Mercado Pago foi feita.</p>
                  </div>
                </div>
              </>
            ) : (
              <p role="status">
                O QR ilustrativo expirou. Você ainda pode concluir a simulação abaixo; nenhum Pix
                real será cobrado.
              </p>
            )}
            <p className="pix-demo-warning">
              Ao continuar, o pedido será registrado como pago apenas para demonstração local. Não
              houve transferência real.
            </p>
            <Button
              variant="primary"
              onClick={handleConfirmDemoPixPayment}
              disabled={isSubmitting || emailVerified === false}
            >
              {isSubmitting ? 'Finalizando...' : 'Simular pagamento e finalizar compra'}
            </Button>
          </section>
        )}
        {activeCheckout && (
          <section
            ref={checkoutStatusRef}
            className="checkout-section checkout-payment-status"
            aria-live="polite"
          >
            <h3>
              {checkoutStatus?.status === 'approved'
                ? 'Pagamento confirmado'
                : ['rejected', 'cancelled', 'failed'].includes(checkoutStatus?.status)
                  ? 'Pagamento não concluído'
                  : 'Aguardando confirmação do Mercado Pago'}
            </h3>
            <p>
              {checkoutStatus?.status === 'approved'
                ? `Pedido #${checkoutStatus.id_order} confirmado.`
                : ['rejected', 'cancelled', 'failed'].includes(checkoutStatus?.status)
                  ? 'Você pode tentar novamente ou escolher outra forma de pagamento.'
                  : 'Se você ainda não concluiu o pagamento, continue no Mercado Pago. O pedido só será criado após a confirmação.'}
            </p>
            {checkoutPopupBlocked && checkoutStatus?.status === 'pending' && (
              <p>
                O navegador bloqueou a abertura automática. Clique abaixo para abrir o pagamento.
              </p>
            )}
            {checkoutStatus?.status === 'pending' && (
              <a
                className="checkout-payment-link"
                href={activeCheckout.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continuar no Mercado Pago
              </a>
            )}
            {checkoutStatus?.status === 'approved' && (
              <Button variant="primary" onClick={() => navigate('/pedidos')}>
                Ver meus pedidos
              </Button>
            )}
            {checkoutStatus &&
              ['rejected', 'cancelled', 'failed'].includes(checkoutStatus.status) && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActiveCheckout(null);
                    setCheckoutStatus(null);
                    completionHandled.current = false;
                  }}
                >
                  Tentar novamente
                </Button>
              )}
          </section>
        )}
      </div>

      <aside className="checkout-summary card-candy">
        <h2>Resumo do pedido</h2>
        <div className="summary-items">
          {cart.items.map((item) => (
            <div key={item.id_product} className="summary-item">
              <img
                src={`${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || window.location.origin}/uploads/${item.products?.image}`}
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
          disabled={
            isSubmitting ||
            cart.items.length === 0 ||
            emailVerified === false ||
            pixDemoState === 'waiting' ||
            (activeCheckout && ['pending', 'approved'].includes(checkoutStatus?.status))
          }
        >
          {isSubmitting
            ? 'Processando...'
            : isPixDemo
              ? pixDemoState === 'waiting'
                ? 'Pix demonstrativo aberto'
                : 'Ver Pix demonstrativo'
              : selectedPayment && getPaymentMethodKind(selectedPayment.name_payment) !== 'cash'
                ? 'Pagar com Mercado Pago'
                : 'Finalizar Pedido'}
        </Button>
      </aside>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-confirmacao success-modal">
            <div className="success-icon">🎉</div>
            <h3>{pixDemoPaid ? 'Pedido de demonstração finalizado!' : 'Pedido Confirmado!'}</h3>
            {pixDemoPaid ? (
              <p>
                Pedido #{pixDemoOrderId} registrado como pago para teste local. Nenhum dinheiro foi
                transferido; não use essa confirmação como comprovante de pagamento.
              </p>
            ) : (
              <p>
                Obrigada pela preferência. Em breve seu pedido entrará em produção e será entregue!
              </p>
            )}
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
