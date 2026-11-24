import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../componentes/AdminSidebar/AdminSidebar';
import { AdminHeader } from '../../componentes/AdminHeader/AdminHeader';
import { useAuth } from '../../hooks/AuthContext';
import { getUserRole } from '../../hooks/userRole';
import './AdminLayout.css';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const role = getUserRole(user);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-container">
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} role={role} />
      <main className="admin-main-content">
        <AdminHeader
          title={role === 'employee' ? 'Pedidos' : 'Painel Administrativo'}
          onMenuClick={toggleSidebar}
        />
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
