import React, { useEffect, useState } from 'react';
import {
  getAllCategory,
  getAllProducts,
  getAllOrdersForDashboard,
  getAllTypeOfPayment,
} from '../../../services/Api';

import './Dashboard.css';

const Dashboard = () => {
  const [statsData, setStatsData] = useState([
    { id: 1, label: 'Categorias', value: '0', icon: '🏷️', color: '#ff2d78' },
    { id: 2, label: 'Produtos', value: '0', icon: '📦', color: '#a855f7' },
    { id: 3, label: 'Tipo de Pgamento', value: '0', icon: '💸', color: '#f91616' },
    { id: 4, label: 'Pedidos', value: '0', icon: '🛒', color: '#f97316' },
    { id: 5, label: 'Vendas', value: 'R$ 0,00', icon: '💰', color: '#22c55e' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const resCats = await getAllCategory(1, 100);
        const resProducts = await getAllProducts(1, 100);
        const resOrders = await getAllOrdersForDashboard();
        const resPayments = await getAllTypeOfPayment();

        const totalOrdersCount = resOrders.data?.totalItems || 0;
        const arrayPedidos = resOrders.data?.data || [];

        const totalCats =
          resCats.data?.totalItems ||
          (Array.isArray(resCats.data?.data) ? resCats.data.data.length : 0) ||
          (Array.isArray(resCats.data) ? resCats.data.length : 0);

        const totalProds =
          resProducts.data?.totalItems ||
          (Array.isArray(resProducts.data?.data) ? resProducts.data.data.length : 0) ||
          (Array.isArray(resProducts.data) ? resProducts.data.length : 0);

        const totalPayTypes =
          resPayments.data?.totalItems ||
          (Array.isArray(resPayments.data) ? resPayments.data.length : 0) ||
          0;

        const totalVendas = arrayPedidos.reduce((acc, curr) => {
          const valorBruto = curr.total;

          const valorNumerico =
            typeof valorBruto === 'string' ? parseFloat(valorBruto) : Number(valorBruto);

          return acc + (valorNumerico || 0);
        }, 0);

        setStatsData([
          { id: 1, label: 'Categorias', value: totalCats, icon: '🏷️', color: '#ff2d78' },
          { id: 2, label: 'Produtos', value: totalProds, icon: '📦', color: '#a855f7' },
          { id: 3, label: 'Tipo de Pagamento', value: totalPayTypes, icon: '💸', color: '#f97316' },
          { id: 4, label: 'Pedidos', value: totalOrdersCount, icon: '🛒', color: '#f97316' },

          {
            id: 5,
            label: 'Vendas',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalVendas
            ),
            icon: '💰',
            color: '#22c55e',
          },
        ]);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="dash-container">Carregando dados reais...</div>;

  return (
    <div className="dash-container">
      <h1 className="dash-title animate-entrance">Dashboard</h1>
      <p className="dash-subtitle animate-entrance">
        Visão geral do sistema atualizada em tempo real
      </p>

      <div className="stats-grid">
        {statsData.map((item, i) => (
          <div
            key={item.id}
            className="stat-card animate-entrance"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div
              className="stat-icon"
              style={{ backgroundColor: item.color + '15', color: item.color }}
            >
              {item.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{item.label}</span>
              <h2 className="stat-value">{item.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="welcome-section animate-entrance" style={{ animationDelay: '0.5s' }}>
        <h3>Bem-vindo ao Painel Administrativo</h3>
        <div className="welcome-story">
          <p>
            A <strong>UrbanCandy</strong> nasceu do desejo de transformar momentos simples em
            experiências inesquecíveis através do açúcar. Desde o nosso primeiro brigadeiro em{' '}
            <strong>2022</strong>, nossa missão tem sido espalhar doçura e cor pelas ruas da cidade!
            🍬✨
          </p>
          <p className="welcome-status">
            Hoje, sua vitrine brilha com várias delícias cadastradas. Prepare o avental: tem pedidos
            esperando por você! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
