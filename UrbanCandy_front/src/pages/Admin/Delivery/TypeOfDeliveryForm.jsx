import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createTypeOfDelivery, updateTypeOfDelivery } from '../../../services/Api';
import '../Payment/TypeOfPaymentForm.css';

const TypeOfDeliveryForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const deliveryType = state?.deliveryType;
  const [name, setName] = useState(deliveryType?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.warning('Informe o nome do tipo de entrega.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: name.trim() };
      if (deliveryType) {
        await updateTypeOfDelivery(deliveryType.id_type_delivery, payload);
      } else {
        await createTypeOfDelivery(payload);
      }
      toast.success('Tipo de entrega salvo com sucesso.');
      navigate('/admin/tipos-entrega');
    } catch (error) {
      toast.error(error.message || error.mensagem || 'Erro ao salvar tipo de entrega.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <h1 className="form-title">{deliveryType ? 'Editar' : 'Novo'} Tipo de Entrega</h1>
      <form onSubmit={handleSubmit} className="category-card-form">
        <div className="input-group">
          <label htmlFor="delivery-type-name">Nome do tipo de entrega</label>
          <input
            id="delivery-type-name"
            type="text"
            maxLength={255}
            placeholder="Entrega ou Retirada no local"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/admin/tipos-entrega')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TypeOfDeliveryForm;
