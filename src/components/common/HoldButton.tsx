import { VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '../ui/button';
import { useRef } from 'react';

interface HoldButtonProps extends VariantProps<typeof buttonVariants> {
  onClick: () => void;
  children: React.ReactNode;
}

const HoldButton: React.FC<HoldButtonProps> = ({
  variant,
  size,
  onClick,
  children,
}: HoldButtonProps) => {
  const clickInterval = useRef<NodeJS.Timeout | null>(null);
  const handleMouseDown = () => {
    onClick();
    clickInterval.current = setInterval(onClick, 50);
  };

  const handleMouseUp = () => {
    if (clickInterval.current) {
      clearInterval(clickInterval.current);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default HoldButton;
