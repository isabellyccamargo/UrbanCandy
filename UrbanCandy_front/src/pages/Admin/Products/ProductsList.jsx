import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategory, getAllProducts, deleteProduct } from '../../../services/Api';
import { Button } from '../../../componentes/Button/Button';
import AdminFilterSelect from '../../../componentes/AdminFilterSelect/AdminFilterSelect';
import { toast } from 'react-toastify';
import './ProductsList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [idDel, setIdDel] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  const load = async (page = 1, category = selectedCategory) => {
    try {
      setLoading(true);
      const res = await getAllProducts(page, 6, category);
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
    let active = true;

    getAllProducts(currentPage, 6, selectedCategory)
      .then((response) => {
        if (!active) return;
        const { data, totalPages: total } = response.data;
        setProducts(data || []);
        setTotalPages(total || 1);
      })
      .catch(() => {
        if (active) toast.error('Erro ao carregar produtos. 🍬');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    let active = true;

    getAllCategory(1, 100)
      .then((response) => {
        if (!active) return;
        const categoryData = response.data?.data || response.data || [];
        if (!Array.isArray(categoryData)) {
          throw new Error('Formato inválido ao carregar categorias.');
        }
        setCategories(categoryData);
      })
      .catch(() => {
        if (active) toast.error('Erro ao carregar categorias para o filtro.');
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCategoryChange = (value) => {
    setLoading(true);
    setCurrentPage(1);
    setSelectedCategory(value);
  };

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
        <div className="products-header-actions">
          <AdminFilterSelect
            label="Categoria"
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={[
              { value: '', label: 'Todas' },
              ...categories.map((category) => ({
                value: String(category.id_category),
                label: category.name_category,
              })),
            ]}
          />
          <Button variant="primary" onClick={() => navigate('/admin/produtos/form')}>
            + Novo Produto
          </Button>
        </div>
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
                      src={`https://urbancandy.local/uploads/${p.image}`}
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
              disabled={currentPage === 1 || loading}
              onClick={() => {
                setLoading(true);
                setCurrentPage((p) => p - 1);
              }}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={currentPage === totalPages || loading}
              onClick={() => {
                setLoading(true);
                setCurrentPage((p) => p + 1);
              }}
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
