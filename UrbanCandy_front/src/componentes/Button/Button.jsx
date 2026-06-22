import './Button.css';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`btn-universal ${variant}`}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};
