type PillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
  className?: string;
  onClick?: () => void;
}

const PillButton = ({ children, color = "primary", size="medium", className, ...props }: PillButtonProps) => {
  const baseClasses = color === 'primary' ? 'p-green-bg-h text-white' : 'p-blue-bg-h text-white';
  const sizeClasses = size === 'medium' ? 'font-16-b h-10 px-[24px] py-[9px]' : 'font-14-b h-8 px-[24px] py-[6.5px]';

  return (
    <button className={`rounded-full leading-none ${baseClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default PillButton;