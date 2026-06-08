import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllCategory, createProduct, updateProduct } from '../../../services/Api';
import { Button } from '../../../componentes/Button/Button';
import { toast } from 'react-toastify';
import './ProductsForm.css';

const ProductsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editItem = location.state?.produto;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [idCat, setIdCat] = useState('');
  const [desc, setDesc] = useState('');
  const [feat, setFeat] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllCategory();
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Erro ao carregar categorias.');
      }
    })();

    if (editItem) {
      setName(editItem.name);
      setPrice(editItem.price);
      setIdCat(editItem.id_category);
      setDesc(editItem.description || '');
      setFeat(editItem.featured || false);
      setPreview(`http://localhost:3030/uploads/${editItem.image}`);
    }
  }, [editItem]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editItem && !image) {
      toast.error('A foto do produto é obrigatória! 📸');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', Math.max(0, parseFloat(price)));
    formData.append('id_category', idCat);
    formData.append('description', desc);
    formData.append('featured', feat);
    if (image) formData.append('image', image);

    try {
      if (editItem) {
        await updateProduct(editItem.id_product, formData);
        toast.success('Produto atualizado! 🍫');
      } else {
        await createProduct(formData);
        toast.success('Produto salvo! ✨');
      }
      navigate('/admin/produtos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <h1 className="form-title">{editItem ? 'Editar Doce' : 'Novo Doce'}</h1>
      <p className="form-subtitle">Cadastre as delícias da UrbanCandy</p>

      <form onSubmit={handleSubmit} className="category-card-form">
        <div className="product-layout-split">
          <div className="fields-column">
            <div className="input-group">
              <label>Nome do Produto</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Descrição Curta</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                maxLength="255"
              />
            </div>
            <div className="input-row" style={{ display: 'flex', gap: '20px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Categoria</label>
              <select
                className="custom-select"
                value={idCat}
                onChange={(e) => setIdCat(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id_category} value={c.id_category}>
                    {c.name_category}
                  </option>
                ))}
              </select>
            </div>
            <div className="featured-toggle-box" onClick={() => setFeat(!feat)}>
              <div className={`custom-check ${feat ? 'active' : ''}`}>{feat && '✓'}</div>
              <span>Produto em Destaque na vitrine?</span>
            </div>
          </div>

          <div className="image-column">
            <label>Imagem do Produto</label>
            <div
              className="image-dropzone"
              onClick={() => document.getElementById('fileInput').click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="img-preview-full" />
              ) : (
                <div className="upload-msg">
                  <i>+</i>
                  <p>Selecionar Foto</p>
                </div>
              )}
              <input
                id="fileInput"
                type="file"
                onChange={handleFile}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '30px' }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/produtos')}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductsForm;
