import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTypeOfPayment, deleteTypeOfPayment } from '../../../services/Api';
import { Button } from '../../../componentes/Button/Button';
import { toast } from 'react-toastify';
import './TypeOfPaymentList.css';

export const TypeOfPaymentList = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [idDel, setIdDel] = useState(null);
  const navigate = useNavigate();

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllTypeOfPayment(page, 6);
      const data = res.data?.data || res.data || [];
      setTypes(data);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      toast.error('Erro ao carregar pagamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  const confirmDelete = async () => {
    const idT = toast.loading('Removendo...');
    try {
      await deleteTypeOfPayment(idDel);
      toast.update(idT, {
        render: 'Removido! ✨',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      types.length === 1 && currentPage > 1 ? setCurrentPage((p) => p - 1) : load(currentPage);
    } catch {
      toast.update(idT, {
        render: 'Erro ao excluir',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setShowModal(false);
      setIdDel(null);
    }
  };

  return (
    <div className="admin-page animate-entrance">
      <header className="admin-header">
        <div>
          <h1>Tipos de Pagamento</h1>
          <p>Gerencie as formas de recebimento</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/tipos-pagamento/form')}>
          + Novo Tipo de Pagamento
        </Button>
      </header>

      <section className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Método</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3">Carregando...</td>
              </tr>
            ) : (
              types.map((t) => (
                <tr key={t.id_payment}>
                  <td>
                    <strong>#{t.id_payment}</strong>
                  </td>
                  <td>{t.name_payment}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-edit"
                      onClick={() =>
                        navigate('/admin/tipos-pagamento/form', { state: { paymentType: t } })
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        setIdDel(t.id_payment);
                        setShowModal(true);
                      }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination-controls">
          <Button
            variant="secondary"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Anterior
          </Button>
          <span className="page-info">
            Página <strong>{currentPage}</strong> de {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={currentPage === totalPages || loading || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-confirmacao">
            <div className="modal-icon">⚠️</div>
            <h3>Confirmar Exclusão</h3>
            <p>Deseja realmente excluir este tipo de pagamento?</p>
            <div className="modal-buttons">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={confirmDelete}>
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
