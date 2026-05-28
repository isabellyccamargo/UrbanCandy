import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Users } from 'lucide-react';
import LoginModal from '../../componentes/Login/LoginModal';
import { Button } from '../Button/Button';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/AuthContext';
import './Header.css';
import { useCart } from '../../Hooks/UseCart';

export const Header = () => {
  const { user, setUser, logout, isLoginModalOpen, setIsLoginModalOpen } = useAuth();

  const { setIsCartOpen, cart, clearCart } = useCart();

  const navigate = useNavigate();
  const location = useLocation();
  const [intendedPath, setIntendedPath] = useState(null);

  useEffect(() => {
    // 1. Cria um objeto com os parâmetros da URL
    const params = new URLSearchParams(location.search);

    // 2. Se o parâmetro "login" for "true", abre o modal
    if (params.get('login') === 'true') {
      setIsLoginModalOpen(true);

      navigate(location.pathname, { replace: true });
    }
  }, [location, setIsLoginModalOpen, navigate]);

  const handleProtectedLink = (e, path) => {
    e.preventDefault();
    if (!user) {
      setIntendedPath(path);
      setIsLoginModalOpen(true);
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    toast.info('Até logo! Sua sessão foi encerrada. 👋', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });

    // 2. Limpa os dados (como você já fazia)
    localStorage.removeItem('@UrbanCandy:user');
    localStorage.removeItem('@UrbanCandy:token');
    clearCart();
    setUser(null);

    // 3. Redireciona para a Home
    logout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo-area">
          <img src="/src/assets/logo.png" alt="SugarBeat Logo" className="logo-image" />
        </Link>

        <div className="header-actions">
          <div
            className="icon-btn"
            onClick={() => setIsCartOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <ShoppingCart size={24} color="#5D4037" />
            <span className="cart-badge">{cart.items.length}</span>
          </div>

          <div className="user-menu-container">
            <div className="user-menu-trigger">
              <User size={24} color="#5D4037" />
              {user && <span>Olá, {user.nome?.split(' ')[0] || 'Usuário'}</span>}
              <span className="arrow-down">▼</span>
            </div>

            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => handleProtectedLink(e, '/perfil')}
                className="dropdown-item"
              >
                Meu Perfil
              </a>
              <a
                href="#"
                onClick={(e) => handleProtectedLink(e, '/pedidos')}
                className="dropdown-item"
              >
                Meus Pedidos
              </a>
              <a
                href="#"
                onClick={(e) => handleProtectedLink(e, '/admin')}
                className="dropdown-item"
              >
                Área Administrador
              </a>
              <hr />
              {user ? (
                <Button onClick={handleLogout} variant="primary">
                  Sair
                </Button>
              ) : (
                <Button onClick={() => setIsLoginModalOpen(true)} variant="primary">
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(userData) => {
          setIsLoginModalOpen(false);

          setUser(userData);

          if (intendedPath) {
            navigate(intendedPath);
            setIntendedPath(null);
          }
        }}
      />
    </header>
  );
};
