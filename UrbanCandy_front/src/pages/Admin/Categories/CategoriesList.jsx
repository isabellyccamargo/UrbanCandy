import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAllCategory } from '../../../services/Api';
import { Button } from '../../../componentes/Button/Button';
import { toast } from 'react-toastify';
import './CategoriesList.css';

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [idDel, setIdDel] = useState(null);
  const navigate = useNavigate();

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllCategory(page, 6);
      const { data, totalPages: total } = res.data;
      setCategorias(data || []);
      setTotalPages(total || 1);
    } catch {
      toast.error('Erro ao carregar categorias. 🍬');
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
      await api.delete(`/categoria/excluir/${idDel}`);
      toast.update(idT, {
        render: 'Removida! ✨',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      categorias.length === 1 && currentPage > 1 ? setCurrentPage((p) => p - 1) : load(currentPage);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao excluir.';
      toast.update(idT, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setShowModal(false);
      setIdDel(null);
    }
  };

  return (
    <div className="admin-page animate-entrance">
      <header className="admin-header">
        <div>
          <h1>Categorias</h1>
          <p>Gerencie as categorias de produtos</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/categorias/form')}>
          + Nova Categoria
        </Button>
      </header>

      <section className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome da Categoria</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3">Carregando...</td>
              </tr>
            ) : (
              categorias.map((cat) => (
                <tr key={cat.id_category}>
                  <td>#{cat.id_category}</td>
                  <td>{cat.name_category}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-edit"
                      onClick={() =>
                        navigate('/admin/categorias/form', { state: { categoria: cat } })
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        setIdDel(cat.id_category);
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
            <p>Deseja realmente excluir esta categoria?</p>
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
