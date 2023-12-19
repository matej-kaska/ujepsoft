type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  color?: "primary" | "secondary" | "accent";
  size?: "medium" | "large" | "small";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  onClick?: () => void;
}

const Button = ({
  children,
  color = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  className,
  ...props
}: ButtonProps) => {

  return (
    <button className={`button ${color} ${size} ${className && className}`} {...props}>
      {icon && iconPosition === "left" && <span className="button-icon mr-2">{icon}</span>}
      {children && children}
      {icon && iconPosition === "right" && <span className="button-icon ml-2">{icon}</span>}
    </button>
  );
}

export default Button;
