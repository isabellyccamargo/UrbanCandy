import { useEffect, useState, useRef } from "react";
import { getAllProducts } from "../../services/Api";
import { CardProduct } from "../../componentes/CardProduct/CardProduct";
import { CategoryCard } from "../../componentes/Category/CategoryCard";
import { FeatureCard } from "../../componentes/Featured/FeaturedCard";
import { Link } from "react-router-dom";
import { FEATURES, CATEGORY_IMAGES } from "./HomeData";
import { toast } from "react-toastify";
import sobre1 from "../../assets/sobre1.png";
import sobre2 from "../../assets/sobre2.png";
import sobre3 from "../../assets/sobre3.png";
import imginicio from "../../assets/imgInicio.jpg";
import imginicio2 from "../../assets/imginicio2.jpg";
import imginicio3 from "../../assets/imginicio3.png";
import "./Home.css";

const SectionHeader = ({ title, sub }) => (
  <div className="categories-header">
    <h2>{title}</h2>
    <p>{sub}</p>
  </div>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [imginicio, imginicio2, imginicio3];
  
  // 1. Referência criada corretamente aqui
  const destaquesRef = useRef(null);

  // 2. Função de scroll suave mapeada
  const scrollToDestaques = (e) => {
    e.preventDefault(); 
    destaquesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, heroImages.length]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts(1, 300);

        const productsArray = response?.data?.data || [];

        if (!Array.isArray(productsArray)) {
          throw new Error("Formato de dados inválido");
        }

        const featuredProducts = productsArray.filter(
          (p) =>
            p.featured == 1 ||
            p.featured == true ||
            p.featured === "1" ||
            p.featured === "true",
        );

        setProducts(featuredProducts);

        const uniqueCategories = Array.from(
          new Set(
            productsArray.map(
              (p) => p.category?.name_category || p.category || "Geral",
            ),
          ),
        ).map((name) => ({
          name,
          image:
            CATEGORY_IMAGES[name] ||
            productsArray.find(
              (p) => (p.category?.name_category || p.category) === name,
            )?.image,
        }));

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Erro na Home:", err);
        toast.error(
          "Ops! Tivemos um problema ao carregar nossos doces. Tente atualizar a página! 🍬",
          {
            theme: "colored",
          },
        );
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <main className="home-container">
      {!loading && (
        <>
          <section className="hero-section animate-entrance">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className={`hero-bg-image ${index === currentSlide ? "active" : ""}`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}

            <div className="hero-overlay">
              <div className="hero-badge">
                <span>✨ Doçaria Artesanal Premium</span>
              </div>

              <div className="hero-content">
                <h1>
                  Doces que <br />
                  <span>Conquistam Corações</span>
                </h1>
                <p className="hero-subtitle">Macios, úmidos e irresistíveis</p>
                <p className="hero-description">
                  Ingredientes nobres, receitas exclusivas e muito amor em cada
                  criação. Descubra o sabor da verdadeira confeitaria artesanal.
                </p>

                <div className="hero-actions">
                  <Link
                    to="../cardapio/brigadeiros"
                    className="btn-hero-filled"
                  >
                    Explorar Cardápio <span className="arrow">➔</span>
                  </Link>
                  {/* Botão configurado com o clique para scroll */}
                  <a
                    href="#destaques"
                    className="btn-hero-outline"
                    onClick={scrollToDestaques}
                  >
                    Ver Favoritos
                  </a>
                </div>
              </div>

              <div className="hero-carousel-dots">
                {heroImages.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(index)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <h3>100+</h3>
                  <p>Clientes Felizes</p>
                </div>
                <div className="stat-item">
                  <h3>4.9 ★</h3>
                  <p>Avaliação Média</p>
                </div>
                <div className="stat-item">
                  <h3>100%</h3>
                  <p>Artesanal</p>
                </div>
              </div>
            </div>
          </section>

          <section className="welcome-highlight">
            <span className="welcome-tag">Artesanal & Urbano</span>
            <h2>
              Onde a cidade encontra a sua <span>doçura favorita</span>
            </h2>
            <div className="divider-candy"></div>
          </section>

          {/* AJUSTADO: Adicionado ref={destaquesRef} aqui embaixo para receber a rolagem */}
          <section ref={destaquesRef} className="highlights-section animate-entrance" id="destaques">
            <SectionHeader
              title="Destaques da Casa"
              sub="Os produtos mais amados pelos nossos clientes"
            />
            <div className="carousel-container">
              <div className="products-slider">
                {products.length > 0 ? (
                  [...products, ...products].map((p, i) => (
                    <div className="slider-item" key={`${p.id_product}-${i}`}>
                      <CardProduct product={p} />
                    </div>
                  ))
                ) : (
                  <p className="no-data-msg">
                    Nenhum destaque disponível no momento.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="categories-section animate-entrance">
            <SectionHeader
              title="Nosso Cardápio"
              sub="Escolha sua categoria favorita e descubra os sabores. Aqui você escolhe seu doce favorito e fazemos na hora. Fresquinho e delicioso!"
            />
            <div className="categories-grid">
              {categories.map((cat, i) => (
                <CategoryCard key={i} title={cat.name} image={cat.image} />
              ))}
            </div>
          </section>

          <section className="features-section animate-entrance">
            <SectionHeader
              title="Por que nos escolher?"
              sub="Qualidade, sabor e carinho em cada mordida"
            />
            <div className="features-grid">
              {FEATURES.map((f, i) => (
                <FeatureCard key={i} {...f} />
              ))}
            </div>
          </section>

          <section className="about-section animate-entrance">
            <div className="about-container">
              <div className="about-text">
                <h2>
                  Doces feitos com <span>amor e dedicação</span>
                </h2>
                <p>
                  Na Urban Candy, cada doce é uma obra de arte artesanal.
                  Utilizamos ingredientes premium e receitas exclusivas.
                </p>
                <div className="about-buttons">
                  <Link to="/cardapio/brigadeiros" className="btn-filled">
                    Ver Cardápio
                  </Link>
                </div>
              </div>

              <div className="about-image-grid">
                <div className="img-box top-left">
                  <img src={sobre1} alt="Doce 1" />
                </div>
                <div className="img-box main-right">
                  <img src={sobre2} alt="Doce 2" />
                </div>
                <div className="img-box bottom-left">
                  <img src={sobre3} alt="Doce 3" />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default Home;