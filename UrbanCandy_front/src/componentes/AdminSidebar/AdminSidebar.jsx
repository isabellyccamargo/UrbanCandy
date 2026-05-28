import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, Package, LogOut } from 'lucide-react';
import { CreditCard } from 'lucide-react';
import './AdminSidebar.css';

export const AdminSidebar = ({ isOpen, onClose }) => {
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
        <Link to="/admin" className={`nav-item ${isActive('/admin')}`} onClick={onClose}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

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
