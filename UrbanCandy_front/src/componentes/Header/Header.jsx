import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Users } from 'lucide-react';
import LoginModal from '../../componentes/Login/LoginModal';
import { Button } from '../Button/Button';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/AuthContext';
import { getUserRole } from '../../hooks/userRole';
import './Header.css';
import { useCart } from '../../hooks/UseCart';
import { getUserProfile } from '../../services/Api';
import logoImg from '../../assets/logo.png';
import { NotificationCenter } from '../Notifications/NotificationCenter';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const baseUrl = (import.meta.env.VITE_API_URL || window.location.origin)
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');
  return `${baseUrl}/${String(imagePath).replace(/^\/+/, '')}`;
};

const UserAvatar = ({ user, userName }) => {
  const userId = user?.id_user || user?.id;
  const [userImage, setUserImage] = useState(() =>
    getImageUrl(user?.people?.image || user?.people?.foto || user?.image || user?.foto)
  );
  const [avatarColor, setAvatarColor] = useState(() =>
    userId && localStorage.getItem(`@UrbanCandy:avatarColor:${userId}`) === 'pink'
      ? 'pink'
      : 'dark'
  );
  const [useInitialAvatar, setUseInitialAvatar] = useState(() =>
    userId && localStorage.getItem(`@UrbanCandy:avatarMode:${userId}`) === 'initial'
  );

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;

    const handleAvatarColorChange = (event) => {
      if (Number(event.detail?.userId) === Number(userId)) {
        setAvatarColor(event.detail.color === 'pink' ? 'pink' : 'dark');
      }
    };
    const handleAvatarModeChange = (event) => {
      if (Number(event.detail?.userId) === Number(userId)) {
        setUseInitialAvatar(event.detail.mode === 'initial');
      }
    };
    window.addEventListener('avatarColorChange', handleAvatarColorChange);
    window.addEventListener('avatarModeChange', handleAvatarModeChange);

    getUserProfile(userId)
      .then((profile) => {
        if (!active) return;
        const person = profile?.people || profile || {};
        const imagePath =
          person.image || person.foto || profile?.image || profile?.foto ||
          user?.image || user?.foto;
        setUserImage(getImageUrl(imagePath));
      })
      .catch((error) => {
        if (active) {
          console.error('Erro ao carregar foto do perfil no cabeçalho:', error);
        }
      });

    return () => {
      active = false;
      window.removeEventListener('avatarColorChange', handleAvatarColorChange);
      window.removeEventListener('avatarModeChange', handleAvatarModeChange);
    };
  }, [user, userId]);

  if (userImage && !useInitialAvatar) {
    return (
      <img
        className="user-avatar-image"
        src={userImage}
        alt=""
        onError={() => setUserImage('')}
      />
    );
  }

  return user ? (
    <span className={`user-avatar-initial user-avatar-${avatarColor}`} aria-hidden="true">
      {userName.trim().charAt(0).toUpperCase() || '?'}
    </span>
  ) : (
    <User size={24} color="#5D4037" aria-hidden="true" />
  );
};

export const Header = () => {
  const { user, setUser, logout, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const userRole = getUserRole(user);

  const { setIsCartOpen, cart, clearCart } = useCart();

  const navigate = useNavigate();
  const location = useLocation();
  const [intendedPath, setIntendedPath] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userName = user?.nome || user?.name || user?.people?.name || '';
  const userId = user?.id_user || user?.id;

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isUserMenuOpen]);

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
    setIsUserMenuOpen(false);
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
          <img src={logoImg} alt="SugarBeat Logo" className="logo-image" />
        </Link>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={`Abrir carrinho com ${cart.items.length} itens`}
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={24} color="#5D4037" aria-hidden="true" />
            <span className="cart-badge" aria-hidden="true">
              {cart.items.length}
            </span>
          </button>

          <NotificationCenter />

          <div
            ref={userMenuRef}
            data-testid="user-menu-container"
            className={`user-menu-container${isUserMenuOpen ? ' is-open' : ''}`}
          >
            <button
              data-testid="user-menu-trigger"
              className="user-menu-trigger"
              type="button"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
            >
              <UserAvatar key={userId || 'guest'} user={user} userName={userName} />

              {user && (
                <span data-testid="logged-user" className="user-name-text">
                  Olá, {userName.split(' ')[0] || 'Usuário'}
                </span>
              )}

              <span className="arrow-down" aria-hidden="true">
                ▼
              </span>
            </button>

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
              {userRole && (
                <a
                  href="#"
                  onClick={(e) =>
                    handleProtectedLink(e, userRole === 'manager' ? '/admin' : '/admin/pedidos')
                  }
                  className="dropdown-item"
                >
                  {userRole === 'manager' ? 'Painel do gerente' : 'Gerenciar pedidos'}
                </a>
              )}
              <hr />
              {user ? (
                <Button onClick={handleLogout} variant="primary">
                  Sair
                </Button>
              ) : (
                <Button
                  data-testid="btn-open-login"
                  onClick={() => setIsLoginModalOpen(true)}
                  variant="primary"
                >
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
          setIsUserMenuOpen(false);

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
