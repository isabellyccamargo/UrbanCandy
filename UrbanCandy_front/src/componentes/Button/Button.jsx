import './Button.css';

export const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled }) => {
  return (
    <button
      type={type}
      className={`btn-universal ${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
