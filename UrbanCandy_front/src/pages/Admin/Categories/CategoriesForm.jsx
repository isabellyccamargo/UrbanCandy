import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { createCategory } from '../../../services/Api';
import { toast } from 'react-toastify';
import './CategoriesForm.css';

export const CategoriesForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const categoriaParaEditar = state?.categoria;

  const [nameCategory, setNameCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoriaParaEditar) {
      setNameCategory(categoriaParaEditar.name_category);
    }
  }, [categoriaParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = nameCategory.trim();

    if (!trimmedName) {
      return toast.warning('O nome da categoria é obrigatório! ✍️');
    }

    setLoading(true);
    const idToast = toast.loading(categoriaParaEditar ? 'Atualizando...' : 'Criando...');

    try {
      if (categoriaParaEditar) {
        await api.put(`/categoria/atualizar/${categoriaParaEditar.id_category}`, {
          name_category: trimmedName,
        });
      } else {
        await createCategory({ name_category: trimmedName });
      }

      toast.update(idToast, {
        render: `Categoria ${categoriaParaEditar ? 'atualizada' : 'criada'} com sucesso! ✨`,
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        theme: 'colored',
      });

      setTimeout(() => navigate('/admin/categorias'), 1500);
    } catch (error) {
      let msgErro = 'Erro ao salvar categoria.';
      const data = error.response?.data;

      if (
        error.response?.status === 409 ||
        (typeof data === 'string' && data.includes('CATEGORY_ALREADY_EXISTS'))
      ) {
        msgErro = 'Essa categoria já existe! 🍫';
      } else if (data?.message) {
        msgErro = data.message;
      }

      toast.update(idToast, {
        render: msgErro,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <header className="form-header">
        <h1 className="form-title">
          {categoriaParaEditar ? 'Editar Categoria' : 'Nova Categoria'}
        </h1>
        <p className="form-subtitle">
          {categoriaParaEditar
            ? 'Altere o nome da categoria selecionada'
            : 'Preencha o nome da nova categoria'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="category-card-form">
        <div className="input-group">
          <label htmlFor="categoryName">Nome da Categoria</label>
          <input
            id="categoryName"
            type="text"
            placeholder="Ex: Brigadeiros, Cookies..."
            value={nameCategory}
            onChange={(e) => setNameCategory(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/admin/categorias')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading
              ? 'Processando...'
              : categoriaParaEditar
                ? 'Salvar Alterações'
                : 'Criar Categoria'}
          </button>
        </div>
      </form>
    </div>
  );
};
