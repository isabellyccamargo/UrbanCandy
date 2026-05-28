import { useNavigate } from 'react-router-dom';
import './CategoryCard.css';

export const CategoryCard = ({ title, image }) => {
  const navigate = useNavigate();
  const baseImgUrl = 'http://localhost:3030/uploads/';

  const nomeExibicao = typeof title === 'object' ? title.name_category : title;

  return (
    <div
      className="category-card"
      onClick={() => navigate(`/cardapio/${String(nomeExibicao).toLowerCase()}`)}
    >
      <div className="category-image-container">
        <img src={`${baseImgUrl}${image}`} alt={nomeExibicao} />

        <div className="category-overlay">
          <div className="overlay-content">
            <span className="overlay-icon">❯</span>
            <p>Ver Sabores</p>
          </div>
        </div>
      </div>

      <div className="category-title">
        <h3>{nomeExibicao}</h3>
      </div>
    </div>
  );
};
