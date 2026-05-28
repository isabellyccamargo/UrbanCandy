import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { getProductsByCategory, getAllCategory } from '../../services/Api';
import { CardProduct } from '../../componentes/CardProduct/CardProduct';
import { toast } from 'react-toastify';
import './MenuByCategory.css';

export const MenuByCategory = () => {
  const { categoryName } = useParams();
  const [categoriesMenu, setCategoriesMenu] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = (res) => res.data?.data || res.data || res;

  useEffect(() => {
    (async () => {
      try {
        const response = await getAllCategory();
        setCategoriesMenu(getData(response));
      } catch {
        toast.error('Erro ao carregar menu de categorias. 🍫');
      }
    })();
  }, []);

  useEffect(() => {
    if (!categoryName) return;

    (async () => {
      setLoading(true);
      try {
        const response = await getProductsByCategory(categoryName, 1, 100);
        const rawData = getData(response);
        const productList = Array.isArray(rawData) ? rawData : [];

        setProducts(productList);
        if (productList.length === 0) {
          toast.info(`Ainda não temos doces em ${categoryName}. ✨`);
        }
      } catch {
        setProducts([]);
        toast.error(`Erro ao carregar os doces de ${categoryName}. 🍬`);
      } finally {
        setLoading(false);
      }
    })();

    window.scrollTo(0, 0);
  }, [categoryName]);

  return (
    <main className="menu-container animate-entrance">
      <nav className="category-nav">
        <ul>
          {categoriesMenu.map((cat) => (
            <li key={cat.id_category}>
              <NavLink
                to={`/cardapio/${cat.name_category.toLowerCase()}`}
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                {cat.name_category}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <header className="menu-header">
        <h1 style={{ textTransform: 'capitalize' }}>{categoryName}</h1>
        <div className="divider"></div>
        <h2 className="menu-subtitle">Escolha seu sabor favorito</h2>
      </header>

      {loading ? (
        <div className="loading-container">
          <div className="candy-loader"></div>
          <p>Buscando as melhores opções para você...</p>
        </div>
      ) : (
        <section className="products-grid">
          {products.length > 0 ? (
            products.map((p) => (
              <CardProduct key={p.id_product} product={p} showDescription={true} />
            ))
          ) : (
            <div className="no-products-feedback">
              <p>Nenhum doce encontrado nesta categoria. ✨</p>
              <span className="hint">Que tal explorar outras categorias acima?</span>
            </div>
          )}
        </section>
      )}
    </main>
  );
};
