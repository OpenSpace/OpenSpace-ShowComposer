import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  duration: number;
  fadeOutDuration: number;
}

export interface StatusBarRef {
  triggerAnimation: () => void;
}

const StatusBar = forwardRef<StatusBarRef, StatusBarProps>(
  ({ duration: incDuration, fadeOutDuration: incFadeDuration }, ref) => {
    const [isAnimatingWidth, setIsAnimatingWidth] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [duration, setDuration] = useState(incDuration);
    const [fadeOutDuration, _setFadeOutDuration] = useState(incFadeDuration);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const triggerAnimation = () => {
      setStartTime(Date.now());
      setIsAnimatingWidth(true);
    };

    useImperativeHandle(ref, () => ({
      triggerAnimation
    }));

    useEffect(() => {
      setDuration(incDuration);
    }, [incDuration]);

    useEffect(() => {
      if (isAnimatingWidth) {
        const widthAnimationDuration = duration * 1000;
        // const totalAnimationDuration = widthAnimationDuration + fadeOutDuration * 1000;
        const updateProgress = () => {
          if (startTime) {
            const elapsedTime = Date.now() - startTime;
            const newProgress = Math.min(
              (elapsedTime / widthAnimationDuration) * 100,
              100
            );
            setProgress(newProgress);

            if (newProgress < 100) {
              requestAnimationFrame(updateProgress);
            }
          }
        };
        updateProgress();

        // Trigger opacity fade-out after width animation completes
        const widthAnimationTimeout = setTimeout(() => {
          setIsFadingOut(true);
        }, widthAnimationDuration);

        // Reset component state after fade-out completes
        const fadeOutTimeout = setTimeout(() => {
          setIsAnimatingWidth(false);
          setIsFadingOut(false);
          setProgress(0);
        }, widthAnimationDuration + fadeOutDuration);

        return () => {
          clearTimeout(widthAnimationTimeout);
          clearTimeout(fadeOutTimeout);
        };
      }
    }, [isAnimatingWidth, duration, fadeOutDuration]);

    return (
      <div
        className={cn(
          'absolute left-0 top-0 flex h-full w-full flex-col justify-end p-4 ease-linear',
          {
            'pointer-events-none': isAnimatingWidth,
            'pointer-events-auto': !isAnimatingWidth,
            'duration-[ms] opacity-0 transition-opacity': isFadingOut,
            'opacity-100': !isFadingOut
          }
        )}
        style={{
          transitionDuration: isFadingOut ? `${fadeOutDuration}ms` : '0ms',
          opacity: !(isAnimatingWidth || isFadingOut) ? 0 : ''
        }}
      >
        <Progress value={progress} />
      </div>
    );
  }
);

export default StatusBar;
