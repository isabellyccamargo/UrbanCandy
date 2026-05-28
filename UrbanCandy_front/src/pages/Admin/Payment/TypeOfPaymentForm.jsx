import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createTypeOfPayment, updateTypeOfPayment } from '../../../services/Api';
import { toast } from 'react-toastify';

export const TypeOfPaymentForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const paymentType = state?.paymentType;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paymentType) setName(paymentType.name_payment);
  }, [paymentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning('Nome obrigatório! 💳');

    setLoading(true);
    const idT = toast.loading('Salvando...');

    try {
      const payload = { name_payment: name };
      paymentType
        ? await updateTypeOfPayment(paymentType.id_payment, payload)
        : await createTypeOfPayment(payload);

      toast.update(idT, {
        render: 'Salvo com sucesso! ✨',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => navigate('/admin/tipos-pagamento'), 1000);
    } catch {
      toast.update(idT, {
        render: 'Erro ao salvar',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <h1 className="form-title">{paymentType ? 'Editar' : 'Novo'} Tipo de Pagamento</h1>

      <form onSubmit={handleSubmit} className="category-card-form">
        <div className="input-group">
          <label>Nome do Pagamento</label>
          <input
            type="text"
            placeholder="Pix, Cartão..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/admin/tipos-pagamento')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? '...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};
