/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/Api';
import { Button } from '../componentes/Button/Button';

const AuthContext = createContext({});

// O AuthContext cuida da identidade (quem é o usuário e se o token é válido) controla globalmente a exibição de informações do usuário
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const isAlerting = useRef(false);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@UrbanCandy:token');
    localStorage.removeItem('@UrbanCandy:user');
    delete api.defaults.headers.Authorization;
  };

  useEffect(() => {
    const loadStorageData = () => {
      const savedUser = localStorage.getItem('@UrbanCandy:user');
      const savedToken = localStorage.getItem('@UrbanCandy:token');

      if (savedUser && savedToken) {
        api.defaults.headers.Authorization = `Bearer ${savedToken}`;
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    loadStorageData();

    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const requestUrl = error.config?.url || '';

        if (error.response?.status === 401 && !requestUrl.includes('/login')) {
          if (isAlerting.current) return Promise.reject(error);

          isAlerting.current = true;
          logout();
          setShowSessionModal(true);
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const handleSessionOk = () => {
    setShowSessionModal(false);
    isAlerting.current = false;

    setIsLoginModalOpen(true);
  };

  const login = (userData) => {
    const userProfile = userData.user || userData;
    setUser(userProfile);
    localStorage.setItem('@UrbanCandy:user', JSON.stringify(userProfile));

    if (userData.token) {
      localStorage.setItem('@UrbanCandy:token', userData.token);
      api.defaults.headers.Authorization = `Bearer ${userData.token}`;
    }
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}

      {showSessionModal && (
        <div className="modal-overlay">
          <div className="modal-confirmacao">
            <h3 style={{ color: '#5D4037' }}>Sessão Expirada 🍬</h3>
            <p>
              Sua sessão expirou por segurança. Clique no botão abaixo para entrar novamente e
              continuar suas compras.
            </p>
            <div className="modal-buttons" style={{ justifyContent: 'center' }}>
              <Button variant="primary" onClick={handleSessionOk}>
                Entrar Novamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
