import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../componentes/Button/Button';
import { deleteTypeOfDelivery, getAllDeliveryTypes } from '../../../services/Api';
import { toast } from 'react-toastify';
import './TypeOfDeliveryList.css';

const TypeOfDeliveryList = () => {
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const response = await getAllDeliveryTypes();
      setDeliveryTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao carregar tipos de entrega.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getAllDeliveryTypes()
      .then((response) => {
        if (active) {
          setDeliveryTypes(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(error.response?.data?.message || 'Erro ao carregar tipos de entrega.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const confirmDelete = async () => {
    try {
      await deleteTypeOfDelivery(typeToDelete.id_type_delivery);
      toast.success('Tipo de entrega removido.');
      setTypeToDelete(null);
      await load();
    } catch (error) {
      toast.error(error.message || error.mensagem || 'Erro ao excluir tipo de entrega.');
      setTypeToDelete(null);
    }
  };

  return (
    <div className="admin-page animate-entrance">
      <header className="admin-header">
        <div>
          <h1>Tipos de Entrega</h1>
          <p>Gerencie as opções de entrega e retirada</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/tipos-entrega/form')}>
          + Novo Tipo de Entrega
        </Button>
      </header>

      <section className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Tipo de Entrega</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3">Carregando...</td>
              </tr>
            ) : deliveryTypes.length ? (
              deliveryTypes.map((type) => (
                <tr key={type.id_type_delivery}>
                  <td>#{type.id_type_delivery}</td>
                  <td>{type.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-edit"
                      onClick={() =>
                        navigate('/admin/tipos-entrega/form', { state: { deliveryType: type } })
                      }
                    >
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => setTypeToDelete(type)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  Nenhum tipo de entrega cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {typeToDelete && (
        <div className="modal-overlay">
          <div className="modal-confirmacao">
            <h3>Confirmar exclusão</h3>
            <p>Deseja excluir o tipo de entrega “{typeToDelete.name}”?</p>
            <div className="modal-buttons">
              <Button variant="secondary" onClick={() => setTypeToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={confirmDelete}>
                Sim, excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeOfDeliveryList;
