import { useCallback,useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
interface StatusBarControlledProps {
  progress: number; // Float value between 0 and 1
  debounceDuration: number; // Duration in milliseconds
}
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const StatusBarControlled: React.FC<StatusBarControlledProps> = ({
  progress,
  debounceDuration
}) => {
  // const [_width, _setWidth] = useState(0);
  const [_progressState, setProgress] = useState(progress);

  const [_isFadingOut, setIsFadingOut] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setThrottleProgress = useCallback(
    throttle((value: number) => {
      setProgress(value);
    }, 100),
    [] // Empty dependency array ensures this function is created only once
  );
  useEffect(() => {
    // this isnt throttleing correct
    // console.log('progress', progress);
    // setThrottleProgress(progress);
    setProgress(progress);
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
  }, [progress, debounceDuration, setThrottleProgress]);

  return (
    <div
      className={cn(
        'duration-400 absolute left-0 top-0 flex h-full w-full flex-col items-center justify-end rounded-lg bg-white/0 p-4 transition-opacity ease-linear',
        {
          // 'opacity-0': isFadingOut,
          // 'opacity-100': !isFadingOut,
        }
      )}
    >
      <Progress value={(Math.round(progress * 1000) / 1000) * 100} />
    </div>
  );
};

export default StatusBarControlled;
