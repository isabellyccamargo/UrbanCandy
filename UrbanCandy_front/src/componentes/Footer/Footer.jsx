import './Footer.css';

export const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-col">
          <h2 className="footer-logo">Urban Candy</h2>
          <p>Doces artesanais feitos com amor para adoçar os seus momentos especiais.</p>
        </div>

        <div className="footer-col">
          <h3>Contato</h3>
          <ul>
            <li>Urban@Urbancandy.com.br</li>
            <li>(11) 99999-9999</li>
            <li>Rua dos Doces, 123 - Pr</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Horário</h3>
          <ul>
            <li>Segunda a Sexta: 9h - 18h</li>
            <li>Sábado: 9h - 14h</li>
            <li>Domingo: Fechado</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <hr />
        <p>&copy; 2026 Urban Candy. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
