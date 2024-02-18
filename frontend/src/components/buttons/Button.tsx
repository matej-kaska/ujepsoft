type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	children?: React.ReactNode;
	color?: "primary" | "secondary" | "accent";
	size?: "medium" | "large" | "small";
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	className?: string;
	onClick?: () => void;
	type: "button" | "submit" | "reset";
};

const Button = ({ children, color = "primary", size = "medium", icon, iconPosition = "left", type = "button", className, ...props }: ButtonProps) => {
	return (
		<button className={`button ${color} ${size} ${className && className}`} {...props} type={type}>
			{icon && iconPosition === "left" && <span className="button-icon mr-2">{icon}</span>}
			{children && children}
			{icon && iconPosition === "right" && <span className="button-icon ml-2">{icon}</span>}
		</button>
	);
};

export default Button;
