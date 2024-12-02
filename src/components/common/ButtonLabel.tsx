import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ButtonLabelProps {
  children: React.ReactNode;
  resize?: boolean;
  className?: string;
}

const ButtonLabel: React.FC<ButtonLabelProps> = ({
  children,
  className,
  resize = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('16px');
  const [lineHeight, setLineHeight] = useState(1.2 * 16);
  useEffect(() => {
    if (!resize) return;
    const adjustFontSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        const newFontSize = Math.max(
          10,
          Math.min(offsetWidth / 10, offsetHeight / 2, 20),
        ); // Adjust the divisor and max size as needed
        setFontSize(`${newFontSize}px`);
        setLineHeight(newFontSize * 1.5);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      adjustFontSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'inline-flex flex-wrap items-center justify-center gap-2 whitespace-nowrap text-wrap rounded-md border-0 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-black text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
        className,
      )}
      style={{
        maxWidth: '90%', // Constrain width to parent
        maxHeight: '90%', // Con
        fontSize,
        lineHeight: `${lineHeight}px`, // Apply calculated line height
      }}
    >
      {children}
    </div>
  );
};

export default ButtonLabel;
