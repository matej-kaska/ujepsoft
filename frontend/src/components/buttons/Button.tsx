type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  color?: "primary" | "secondary" | "lightblue" | "lightgreen";
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
  iconPosition = "left", // Default to "left"
  className,
  ...props
}: ButtonProps) => {
  const baseClasses = color === "secondary" ? "p-blue-bg-h text-white" :
  color === "lightblue" ? "s-blue-bg-h text-white" :
  color === "lightgreen" ? "s-green-bg-h p-blue" :
  "p-green-bg-h text-white";

  const sizeClasses = size === "large" ? "font-20-b h-12 px-[24px] py-[10.5px]" :
    size === "medium" ? "font-16-b h-10 px-[32px] py-[13px]" :
      "font-14-b h-10";

  return (
    <button className={`flex items-center rounded leading-none justify-center ${baseClasses} ${sizeClasses} ${className}`} {...props}>
      {icon && iconPosition === "left" && <span className="button-icon mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="button-icon ml-2">{icon}</span>}
    </button>
  );
}

export default Button;
