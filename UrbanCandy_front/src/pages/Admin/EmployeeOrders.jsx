import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllOrders, getOrderStatuses, updateOrderStatus } from '../../services/Api';
import './EmployeeOrders.css';

const getStatusId = (order) => Number(order.status_id ?? order.status?.id ?? order.status?.id_order_status);
const getStatusName = (order) =>
  String(order.status?.label ?? order.status?.name ?? order.status_name ?? 'Recebido');
const getStatusItemId = (status) => Number(status.id ?? status.id_status);
const getStatusItemName = (status) => String(status.label ?? status.name ?? '');
const getOrders = (response) => response.data?.data || response.data || [];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (value) => {
  if (!value) return 'Data não informada';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data não informada' : date.toLocaleString('pt-BR');
};

const EmployeeOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setError('');
        const [ordersResponse, loadedStatuses] = await Promise.all([
          getAllOrders(),
          getOrderStatuses(),
        ]);
        const loadedOrders = getOrders(ordersResponse);
        setOrders(Array.isArray(loadedOrders) ? loadedOrders : []);
        setStatuses(Array.isArray(loadedStatuses) ? loadedStatuses : []);
        setSelectedStatusId((current) =>
          current ?? (loadedStatuses.length ? getStatusItemId(loadedStatuses[0]) : null)
        );
      } catch {
        setError('Não foi possível carregar os pedidos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const selectedOrder = orders.find(
    (order) => Number(order.id_orders) === Number(selectedOrderId)
  );
  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (order) => selectedStatusId === null || getStatusId(order) === Number(selectedStatusId)
      ),
    [orders, selectedStatusId]
  );

  const getNextStatus = (order) => {
    const currentName = getStatusName(order).toLowerCase();
    if (
      currentName.includes('cancel') ||
      currentName.includes('entregue') ||
      currentName.includes('concluido')
    ) {
      return null;
    }

    const orderedStatuses = [...statuses].sort(
      (a, b) => getStatusItemId(a) - getStatusItemId(b)
    );
    const currentIndex = orderedStatuses.findIndex(
      (status) => getStatusItemId(status) === getStatusId(order)
    );
    return currentIndex >= 0 ? orderedStatuses[currentIndex + 1] || null : null;
  };

  const advanceOrderStatus = async (order) => {
    const nextStatus = getNextStatus(order);
    if (!nextStatus) return;

    if (!window.confirm(`Deseja alterar o pedido para "${getStatusItemName(nextStatus)}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      await updateOrderStatus(order.id_orders, getStatusItemId(nextStatus));
      const updatedStatus = {
        id: getStatusItemId(nextStatus),
        name: nextStatus.name,
        label: nextStatus.label,
      };
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id_orders === order.id_orders
            ? {
                ...currentOrder,
                status_id: getStatusItemId(nextStatus),
                status: updatedStatus,
              }
            : currentOrder
        )
      );
      toast.success(`Pedido atualizado para ${getStatusItemName(nextStatus)}.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          requestError.response?.data?.mensagem ||
          'Não foi possível atualizar o status do pedido.'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="employee-orders-state">Carregando pedidos...</div>;

  return (
    <div className="employee-orders-page">
      <header className="employee-orders-heading">
        <div>
          <h1>Pedidos</h1>
          <p>Acompanhe os pedidos e atualize cada etapa do preparo.</p>
        </div>
      </header>

      {error && <p className="employee-orders-error" role="alert">{error}</p>}

      <div className="employee-orders-statuses" role="tablist" aria-label="Filtrar por status">
        {statuses.map((status) => {
          const id = getStatusItemId(status);
          const count = orders.filter((order) => getStatusId(order) === id).length;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selectedStatusId === id}
              className={selectedStatusId === id ? 'selected' : ''}
              onClick={() => setSelectedStatusId(id)}
            >
              {getStatusItemName(status)} <span>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="employee-orders-content">
        <section className="employee-orders-list" aria-label="Lista de pedidos">
          {visibleOrders.length ? (
            visibleOrders.map((order) => (
              <button
                type="button"
                key={order.id_orders}
                className={`employee-order-card${selectedOrderId === order.id_orders ? ' active' : ''}`}
                onClick={() => setSelectedOrderId(order.id_orders)}
              >
                <span className="employee-order-card-heading">
                  <strong>Pedido #{order.id_orders}</strong>
                  <span>{getStatusName(order)}</span>
                </span>
                <span>{order.people?.name || order.user?.name || 'Cliente'}</span>
                <span>
                  {order.deliveryType?.name || 'Retirada no local'} · {(order.items || []).length} itens
                </span>
                <span className="employee-order-card-footer">
                  {formatDate(order.order_date)} <strong>{formatCurrency(order.total)}</strong>
                </span>
              </button>
            ))
          ) : (
            <p className="employee-orders-empty">Nenhum pedido neste status.</p>
          )}
        </section>

        <section className="employee-order-details" aria-live="polite">
          {selectedOrder ? (
            <>
              <div className="employee-order-detail-heading">
                <div>
                  <p>Detalhes do pedido</p>
                  <h2>#{selectedOrder.id_orders}</h2>
                </div>
                <span className="employee-order-status">{getStatusName(selectedOrder)}</span>
              </div>
              <dl className="employee-order-summary">
                <div>
                  <dt>Cliente</dt>
                  <dd>{selectedOrder.people?.name || selectedOrder.user?.name || 'Não informado'}</dd>
                </div>
                <div>
                  <dt>Telefone</dt>
                  <dd>{selectedOrder.people?.telephone || 'Não informado'}</dd>
                </div>
                <div>
                  <dt>Recebido em</dt>
                  <dd>{formatDate(selectedOrder.order_date)}</dd>
                </div>
                <div>
                  <dt>Pagamento</dt>
                  <dd>{selectedOrder.paymentType?.name_payment || 'Não informado'}</dd>
                </div>
                <div>
                  <dt>Entrega</dt>
                  <dd>{selectedOrder.deliveryType?.name || 'Não informado'}</dd>
                </div>
              </dl>
              <h3>Itens do pedido</h3>
              <ul className="employee-order-items">
                {(selectedOrder.items || []).map((item, index) => (
                  <li key={item.id_order_item || `${item.id_product}-${index}`}>
                    <span>
                      {item.quantity} × {item.products?.name || item.product?.name || 'Produto'}
                    </span>
                    <strong>{formatCurrency(item.sub_total || Number(item.unit_price) * item.quantity)}</strong>
                  </li>
                ))}
                {!selectedOrder.items?.length && <li>Itens não informados.</li>}
              </ul>
              <div className="employee-order-total">
                <span>Total</span>
                <strong>{formatCurrency(selectedOrder.total)}</strong>
              </div>
              {getNextStatus(selectedOrder) ? (
                <button
                  type="button"
                  className="employee-order-advance"
                  disabled={updating}
                  onClick={() => advanceOrderStatus(selectedOrder)}
                >
                  {updating ? 'Atualizando...' : `Avançar para ${getStatusItemName(getNextStatus(selectedOrder))}`}
                </button>
              ) : (
                <p className="employee-order-finished">Este pedido não possui próximas etapas.</p>
              )}
            </>
          ) : (
            <p className="employee-orders-empty">Selecione um pedido para ver os detalhes.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmployeeOrders;
