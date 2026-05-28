import './FeaturedCard.css';

export const FeatureCard = ({ icon, title, description, image }) => {
  return (
    <div className="feature-card">
      <div className="feature-image-container">
        <img src={image} alt={title} className="feature-bg-image" />
        <div className="feature-icon-badge">
          <span className="material-icons">{icon}</span>
        </div>
      </div>
      <div className="feature-info">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};
