import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyOrders, getUserProfile } from '../../services/Api';
import { Button } from '../../componentes/Button/Button';
import { toast } from 'react-toastify';
import './MyOrders.css';

const getOrderStatusClass = (statusName) => {
  const normalizedStatus = String(statusName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalizedStatus.includes('cancel')) return 'status-canceled';
  if (normalizedStatus.includes('preparando')) return 'status-preparing';
  if (normalizedStatus.includes('pronto')) return 'status-ready';
  if (normalizedStatus.includes('entregue') || normalizedStatus.includes('concluido')) {
    return 'status-delivered';
  }
  return 'status-pending';
};

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const requestedOrderId = Number(searchParams.get('pedido') || 0);

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('@UrbanCandy:user'));
        const userId = user?.id_user || user?.id;
        let personId =
          user?.id_people ||
          user?.people?.id_people ||
          user?.People?.id_people;

        if (!personId && userId) {
          const profile = await getUserProfile(Number(userId));
          personId =
            profile?.id_people ||
            profile?.people?.id_people ||
            profile?.People?.id_people ||
            profile?.data?.id_people ||
            profile?.data?.people?.id_people;
        }

        if (!personId) {
          toast.error('Não foi possível identificar seu cadastro para carregar os pedidos.');
          return;
        }

        const { data } = await getMyOrders(personId, currentPage, requestedOrderId ? 0 : 5);
        setOrders(data.data || []);
        setTotalPages(data.totalPages || 1);
        if (requestedOrderId) {
          const matchingOrder = (data.data || []).find(
            (order) => Number(order.id_orders) === requestedOrderId
          );
          if (matchingOrder) {
            setSelectedOrder(matchingOrder);
          } else {
            setSelectedOrder(null);
            toast.error('Não foi possível encontrar esse pedido no seu histórico.');
          }
        }
      } catch {
        toast.error('Não foi possível carregar seu histórico de pedidos.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentPage, requestedOrderId]);

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('pedido');
    setSearchParams(nextParams);
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('pedido', String(order.id_orders));
    setSearchParams(nextParams);
  };

  return (
    <div className="orders-page animate-entrance">
      <header className="orders-header">
        <h1>Meus Pedidos</h1>
        <p>Acompanhe o histórico das suas delícias</p>
      </header>

      <section className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Data</th>
              <th>Qtd Itens</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  Carregando...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id_orders}>
                  <td data-label="Pedido">
                    <strong>#{order.id_orders}</strong>
                  </td>
                  <td data-label="Data">
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString('pt-BR')
                      : '---'}
                  </td>
                  <td data-label="Produtos">
                    {(order.items || []).reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)}{' '}
                    itens
                  </td>
                  <td data-label="Total">
                    <strong className="order-total-value">{formatCurrency(order.total)}</strong>
                  </td>
                  <td data-label="Pagamento">
                    <span className="payment-badge">
                      {order.paymentType?.name_payment || 'Padrão'}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`order-status-badge ${getOrderStatusClass(
                        order.status?.label || order.status?.name
                      )}`}
                    >
                      {order.status?.label || order.status?.name || '---'}
                    </span>
                  </td>
                  <td data-label="Detalhes">
                    <Button variant="secondary" onClick={() => showOrderDetails(order)}>
                      Ver pedido
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  Você ainda não realizou nenhum pedido. ✨
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination-controls">
          <Button
            variant="secondary"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Anterior
          </Button>

          <span className="page-info">
            Página <strong>{currentPage}</strong> de {totalPages}
          </span>

          <Button
            variant="secondary"
            disabled={currentPage === totalPages || loading || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Próximo
          </Button>
        </div>
      </section>
      {selectedOrder && (
        <div
          className="order-details-overlay"
          onClick={closeOrderDetails}
          role="presentation"
        >
          <section
            className="order-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="order-details-close"
              type="button"
              aria-label="Fechar detalhes do pedido"
              onClick={closeOrderDetails}
            >
              ×
            </button>
            <h2 id="order-details-title">Pedido #{selectedOrder.id_orders}</h2>
            <p>
              <strong>Status:</strong>{' '}
              <span
                className={`order-status-badge ${getOrderStatusClass(
                  selectedOrder.status?.label || selectedOrder.status?.name
                )}`}
              >
                {selectedOrder.status?.label || selectedOrder.status?.name || '---'}
              </span>
            </p>
            <p>
              <strong>Data:</strong>{' '}
              {selectedOrder.order_date
                ? new Date(selectedOrder.order_date).toLocaleString('pt-BR')
                : '---'}
            </p>
            <h3>Itens do pedido</h3>
            {selectedOrder.items?.length ? (
              <ul className="order-details-items">
                {selectedOrder.items.map((item, index) => (
                  <li key={item.id_orderItem || item.id_order_item || index}>
                    <span>
                      {item.products?.name || item.product?.name || 'Produto'} ×{' '}
                      {Number(item.quantity) || 0}
                    </span>
                    <strong>{formatCurrency(item.sub_total)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Não há itens disponíveis para este pedido.</p>
            )}
            <p className="order-details-total">
              Total: <strong>{formatCurrency(selectedOrder.total)}</strong>
            </p>
            <p>Pagamento: {selectedOrder.paymentType?.name_payment || 'Padrão'}</p>
            <p>Retirada/entrega: {selectedOrder.deliveryType?.name || '---'}</p>
          </section>
        </div>
      )}
    </div>
  );
};
