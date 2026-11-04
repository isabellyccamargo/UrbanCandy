import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tag,
  Package,
  LogOut,
  ClipboardList,
  CreditCard,
  Truck,
  UsersRound,
  ShieldCheck,
} from 'lucide-react';
import './AdminSidebar.css';

export const AdminSidebar = ({ isOpen, onClose, role }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <h2>Administração</h2>
      </div>

      <nav className="sidebar-nav">
        {role === 'manager' ? (
          <>
            <Link to="/admin" className={`nav-item ${isActive('/admin')}`} onClick={onClose}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <p className="sidebar-section-label">Cadastros</p>
            <Link
              to="/admin/categorias"
              className={`nav-item ${isActive('/admin/categorias')}`}
              onClick={onClose}
            >
              <Tag size={20} />
              <span>Categorias</span>
            </Link>
            <Link
              to="/admin/produtos"
              className={`nav-item ${isActive('/admin/produtos')}`}
              onClick={onClose}
            >
              <Package size={20} />
              <span>Produtos</span>
            </Link>
            <Link
              to="/admin/tipos-pagamento"
              className={`nav-item ${isActive('/admin/tipos-pagamento')}`}
              onClick={onClose}
            >
              <CreditCard size={20} />
              <span>Tipo De Pagamento</span>
            </Link>
            <Link
              to="/admin/tipos-entrega"
              className={`nav-item ${isActive('/admin/tipos-entrega')}`}
              onClick={onClose}
            >
              <Truck size={20} />
              <span>Tipo de Entrega</span>
            </Link>
            <p className="sidebar-section-label">Equipe e acessos</p>
            <Link
              to="/admin/usuarios"
              className={`nav-item ${isActive('/admin/usuarios')}`}
              onClick={onClose}
            >
              <UsersRound size={20} />
              <span>Usuários e pessoas</span>
            </Link>
            <Link
              to="/admin/permissoes"
              className={`nav-item ${isActive('/admin/permissoes')}`}
              onClick={onClose}
            >
              <ShieldCheck size={20} />
              <span>Permissões</span>
            </Link>
          </>
        ) : role === 'employee' ? (
          <Link
            to="/admin/pedidos"
            className={`nav-item ${isActive('/admin/pedidos')}`}
            onClick={onClose}
          >
            <ClipboardList size={20} />
            <span>Gerenciar pedidos</span>
          </Link>
        ) : null}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="nav-item logout" onClick={onClose}>
          <LogOut size={20} />
          <span>Voltar ao Site</span>
        </Link>
      </div>
    </aside>
  );
};
