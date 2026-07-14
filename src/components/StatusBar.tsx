import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Progress } from '@mantine/core';

import { cn } from '@/utils/utils';

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
    const triggerAnimation = () => {
      // Reset to 0 first, then flip to animating on the next frame so the fill
      // transitions 0 -> 100 over `duration` (rather than snapping if it was mid-run).
      setIsFadingOut(false);
      setIsAnimatingWidth(false);
      requestAnimationFrame(() => setIsAnimatingWidth(true));
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

        // Trigger opacity fade-out after the width animation completes
        const widthAnimationTimeout = setTimeout(() => {
          setIsFadingOut(true);
        }, widthAnimationDuration);

        // Reset component state after fade-out completes
        const fadeOutTimeout = setTimeout(() => {
          setIsAnimatingWidth(false);
          setIsFadingOut(false);
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
        <Progress
          value={isAnimatingWidth ? 100 : 0}
          size={'xl'}
          radius={'xl'}
          transitionDuration={duration * 1000}
          styles={{
            root: { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
            section: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              transitionTimingFunction: 'linear'
            }
          }}
        />
      </div>
    );
  }
);

export default StatusBar;
