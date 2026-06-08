import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, deleteProduct } from '../../../services/Api';
import { Button } from '../../../componentes/Button/Button';
import { toast } from 'react-toastify';
import './ProductsList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [idDel, setIdDel] = useState(null);
  const navigate = useNavigate();

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAllProducts(page, 6);
      const { data, totalPages: total } = res.data;
      setProducts(data || []);
      setTotalPages(total || 1);
    } catch {
      toast.error('Erro ao carregar produtos. 🍬');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  const confirmDelete = async () => {
    try {
      await deleteProduct(idDel);
      toast.success('Produto removido! ✨');
      // Volta uma página se apagar o único item da página atual
      products.length === 1 && currentPage > 1 ? setCurrentPage((p) => p - 1) : load(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir.');
    } finally {
      setShowModal(false);
      setIdDel(null);
    }
  };

  return (
    <div className="admin-page animate-entrance">
      <header className="admin-header">
        <div>
          <h1>Produtos</h1>
          <p>Gerencie os doces da sua vitrine</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/produtos/form')}>
          + Novo Produto
        </Button>
      </header>

      <section className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagem</th>
              <th>Nome / Descrição</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Destaque</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Carregando...</td>
              </tr>
            ) : products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id_product}>
                  <td>#{p.id_product}</td>
                  <td>
                    <img
                      src={`http://localhost:3030/uploads/${p.image}`}
                      alt={p.name}
                      className="product-img-table"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40?text=Doce';
                      }}
                    />
                  </td>
                  <td>
                    <div className="product-info-cell">
                      <strong>{p.name}</strong>
                      <span className="product-desc-short">{p.description}</span>
                    </div>
                  </td>
                  <td>{p.category?.name_category || 'Geral'}</td>
                  <td>
                    {Number(p.price).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td>
                    <span className={`badge ${p.featured ? 'featured' : 'normal'}`}>
                      {p.featured ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/admin/produtos/form`, { state: { produto: p } })}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        setIdDel(p.id_product);
                        setShowModal(true);
                      }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <Button
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Próximo
            </Button>
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-confirmacao">
            <div className="modal-icon">⚠️</div>
            <h3>Confirmar Exclusão</h3>
            <p>Deseja realmente excluir este produto? Esta ação é irreversível.</p>
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

export default ProductList;
