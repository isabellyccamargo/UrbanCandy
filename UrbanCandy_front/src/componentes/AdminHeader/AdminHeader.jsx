import React from 'react';
import { Menu } from 'lucide-react';
import './AdminHeader.css';

export const AdminHeader = ({ title, onMenuClick }) => {
  return (
    <header className="admin-top-header">
      <button className="menu-button" onClick={onMenuClick} aria-label="Abrir menu">
        <Menu size={24} />
      </button>
      <div className="header-info">
        <span>UrbanCandy</span>
        <h1 className="page-title">{title}</h1>
      </div>
    </header>
  );
};
