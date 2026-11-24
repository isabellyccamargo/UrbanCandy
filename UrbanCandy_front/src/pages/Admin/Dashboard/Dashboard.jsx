import React, { useEffect, useState } from 'react';
import {
  getAllOrdersForDashboard,
  getAllProducts,
} from '../../../services/Api';
import api from '../../../services/Api';
import './Dashboard.css';

const isCancelledOrder = (order) => {
  const statusId = Number(order.status_id ?? order.status?.id_order_status ?? order.status?.id);
  const statusName = String(order.status?.name ?? order.status?.label ?? order.status ?? '').toLowerCase();
  return statusId >= 5 || statusName.includes('cancel');
};

const readArray = (response) => {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

const getOrderDate = (order) => order.order_date || order.created_at || order.createdAt || order.data;
const getOrderValue = (order) =>
  Number(order.total ?? order.valor_total ?? order.valorTotal ?? 0) || 0;

const Dashboard = () => {
  const [dashboard, setDashboard] = useState({
    metrics: { revenue: 0, orders: 0, products: 0, customers: 0 },
    months: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setError('');
        const [productsResult, ordersResult, usersResult] = await Promise.allSettled([
          getAllProducts(1, 100),
          getAllOrdersForDashboard(),
          api.get('/usuario/listar', { params: { page: 1, size: 1 } }),
        ]);

        const productsResponse =
          productsResult.status === 'fulfilled' ? productsResult.value : null;
        const ordersResponse = ordersResult.status === 'fulfilled' ? ordersResult.value : null;
        const usersResponse = usersResult.status === 'fulfilled' ? usersResult.value : null;

        const products = readArray(productsResponse);
        const orders = readArray(ordersResponse).filter((order) => !isCancelledOrder(order));
        const productNames = new Map(
          products.map((product) => [product.id_product, product.name])
        );
        const now = new Date();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const months = Array.from({ length: 4 }, (_, index) => {
          const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
          return {
            label: monthNames[date.getMonth()],
            month: date.getMonth(),
            year: date.getFullYear(),
            total: 0,
          };
        });
        const customers = new Set();
        const productSales = new Map();
        let revenue = 0;

        orders.forEach((order) => {
          const orderValue = getOrderValue(order);
          revenue += orderValue;

          const customerId = order.id_people ?? order.people?.id_people ?? order.id_user;
          if (customerId !== undefined && customerId !== null) customers.add(customerId);

          const dateValue = getOrderDate(order);
          if (dateValue) {
            const date = new Date(dateValue);
            if (!Number.isNaN(date.getTime())) {
              const month = months.find(
                (entry) => entry.month === date.getMonth() && entry.year === date.getFullYear()
              );
              if (month) month.total += orderValue;
            }
          }

          const items = order.items || order.order_items || order.produtos || [];
          if (Array.isArray(items)) {
            items.forEach((item) => {
              const productId = item.id_product ?? item.products?.id_product ?? item.product_id;
              if (productId === undefined || productId === null) return;

              const name =
                item.products?.name ||
                item.product?.name ||
                item.name ||
                productNames.get(productId) ||
                `Produto #${productId}`;
              const quantity = Number(item.quantity ?? item.quantidade ?? item.qty ?? 1);
              const itemTotal =
                Number(item.sub_total ?? item.total) ||
                Number(item.unit_price ?? item.price ?? item.products?.price ?? 0) * quantity;
              const current = productSales.get(productId) || {
                id: productId,
                name,
                quantity: 0,
                total: 0,
              };

              productSales.set(productId, {
                ...current,
                name,
                quantity: current.quantity + quantity,
                total: current.total + itemTotal,
              });
            });
          }
        });

        const usersData = usersResponse?.data;
        const customerCount =
          usersData?.totalItems ??
          usersData?.total ??
          (Array.isArray(usersData?.data) ? usersData.data.length : customers.size);

        setDashboard({
          metrics: {
            revenue,
            orders: orders.length,
            products: productsResponse
              ? productsResponse.data?.totalItems ?? products.length
              : 0,
            customers: customerCount || customers.size,
          },
          months,
          topProducts: [...productSales.values()]
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 3),
        });

        if (productsResult.status === 'rejected' && ordersResult.status === 'rejected') {
          setError('Não foi possível carregar os dados do dashboard.');
        }
      } catch {
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const metricCards = [
    { label: 'Faturamento total', value: dashboard.metrics.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: '💰' },
    { label: 'Pedidos', value: dashboard.metrics.orders, icon: '🛍️' },
    { label: 'Produtos', value: dashboard.metrics.products, icon: '🍬' },
    { label: 'Clientes', value: dashboard.metrics.customers, icon: '👥' },
  ];

  const maxSales = Math.max(...dashboard.months.map((month) => month.total), 1);
  const chartPoints = dashboard.months.map((month, index) => ({
    x: 55 + index * 176,
    y: 160 - (month.total / maxSales) * 112,
    ...month,
  }));

  if (loading) return <div className="dash-container">Carregando dashboard...</div>;

  return (
    <div className="dash-container">
      <header className="dash-heading">
        <h1 className="dash-title">Dashboard</h1>
        <p className="dash-subtitle">Acompanhe o desempenho da UrbanCandy.</p>
      </header>

      {error && <p className="dash-error" role="alert">{error}</p>}

      <div className="stats-grid">
        {metricCards.map((item) => (
          <div className="stat-card" key={item.label}>
            <span className="stat-icon" aria-hidden="true">{item.icon}</span>
            <div className="stat-info">
              <span className="stat-label">{item.label}</span>
              <strong className="stat-value">{item.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-insights">
        <section className="dashboard-panel">
          <h2>Evolução das vendas</h2>
          <p>Faturamento mensal (últimos 4 meses)</p>
          {dashboard.months.length ? (
            <svg
              className="sales-chart"
              viewBox="0 0 640 205"
              role="img"
              aria-label="Gráfico de faturamento mensal nos últimos quatro meses"
            >
              <line x1="30" y1="160" x2="610" y2="160" className="chart-axis" />
              <polyline
                points={chartPoints.map((point) => `${point.x},${point.y}`).join(' ')}
                className="chart-line"
              />
              {chartPoints.map((point) => (
                <g key={`${point.year}-${point.month}`}>
                  <circle cx={point.x} cy={point.y} r="5" className="chart-point" />
                  <text x={point.x} y={point.y - 12} textAnchor="middle" className="chart-value">
                    {point.total >= 1000 ? `R$ ${(point.total / 1000).toFixed(1)}k` : `R$ ${point.total.toFixed(0)}`}
                  </text>
                  <text x={point.x} y="188" textAnchor="middle" className="chart-month">
                    {point.label}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <p className="dashboard-empty">Ainda não há dados de vendas.</p>
          )}
        </section>

        <section className="dashboard-panel top-products-panel">
          <h2>Top 3 produtos mais vendidos</h2>
          <p>Produtos campeões de vendas</p>
          {dashboard.topProducts.length ? (
            <ol className="top-products-list">
              {dashboard.topProducts.map((product, index) => (
                <li key={product.id}>
                  <span className="top-product-medal">{['🥇', '🥈', '🥉'][index]}</span>
                  <span className="top-product-info">
                    <strong>{product.name}</strong>
                    {product.total > 0 && <small>{product.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em vendas</small>}
                  </span>
                  <span className="top-product-quantity">{product.quantity} un.</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="dashboard-empty">Nenhum item contabilizado ainda.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
