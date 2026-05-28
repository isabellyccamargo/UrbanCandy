import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../../services/Api';
import { Button } from '../../componentes/Button/Button';
import { toast } from 'react-toastify';
import './MyOrders.css';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('@UrbanCandy:user'));
      const personId = user?.id_people || user?.id_user || user?.id;

      if (!personId) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      const { data } = await getMyOrders(personId, currentPage, 5);
      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Não foi possível carregar seu histórico de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
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
    </div>
  );
};
