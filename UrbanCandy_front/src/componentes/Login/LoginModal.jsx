import React, { useState } from 'react';
import { loginUser, setHeaderToken } from '../../services/Api';
import { Link } from 'react-router-dom';
import { useCart } from '../../Hooks/UseCart';
import { Button } from '../Button/Button';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useAuth();
  const { syncCart } = useCart();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setCredentials({ email: '', password: '' });
    setError('');
    setShowPass(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Por favor, preencha e-mail e senha');
      return;
    }

    const idToast = toast.loading('Autenticando...');

    try {
      const email = credentials.email.trim();
      const password = credentials.password.trim();

      console.log('Tentando login com:', { email, password: '***' });
      const data = await loginUser(email, password);

      console.log('Resposta do login:', data);

      if (data.token) {
        localStorage.setItem('@UrbanCandy:token', data.token);
        setHeaderToken(data.token);
      }

      const profile = data.user;
      login(profile);

      if (data.id_people) {
        await syncCart(data.id_people);
      }

      toast.update(idToast, {
        render: `Bem-vindo(a), ${profile?.nome || 'Candy Lover'}! 🍬`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      onLoginSuccess(profile);
      handleClose();
    } catch (err) {
      console.error('Erro completo no login:', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        fullError: err,
      });

      const msgErro = err?.message || err?.response?.data?.mensagem || 'E-mail ou senha inválidos';

      toast.update(idToast, {
        render: msgErro,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });

      setError(msgErro);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-x" onClick={handleClose}>
          &times;
        </button>

        <div className="modal-header">
          <h2>Entrar na Conta</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error-message-login">{error}</p>}

          <div className="form-group">
            <label>E-mail</label>
            <input
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="password-wrapper-modal">
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-pass-modal"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </span>
            </div>
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '10px' }}
          >
            <Button type="submit" variant="primary">
              Entrar
            </Button>
          </div>
        </form>

        <p className="footer-text">
          Não tem cadastro?
          <Link to="/perfil/cadastrar" onClick={handleClose}>
            {' '}
            Crie sua conta aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
