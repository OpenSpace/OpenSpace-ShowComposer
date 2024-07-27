import { useState, useEffect, useRef } from 'react';

interface StatusBarControlledProps {
  progress: number; // Float value between 0 and 1
  debounceDuration: number; // Duration in milliseconds
}

const StatusBarControlled: React.FC<StatusBarControlledProps> = ({
  progress,
  debounceDuration,
}) => {
  const [width, setWidth] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update width based on progress
    setWidth(progress * 100);

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset fading state
    setIsFadingOut(false);

    // Set a new debounce timeout to trigger fade-out
    debounceTimeoutRef.current = setTimeout(() => {
      setIsFadingOut(true);
    }, debounceDuration);

    // Cleanup timeout on component unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [progress, debounceDuration]);

  return (
    <div
      className={`duration-400 absolute left-0 top-0 h-full  bg-slate-700/40 transition-opacity ease-linear 
      ${isFadingOut ? 'opacity-0 ' : 'opacity-100'} 
      `}
      style={{
        width: `${width}%`,
      }}
    />
  );
};

export default StatusBarControlled;
