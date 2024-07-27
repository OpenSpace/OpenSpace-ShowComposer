import { set } from 'lodash';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

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
    const [duration, setDuration] = useState(incDuration); // Adjust based on your preference
    const [fadeOutDuration, setFadeOutDuration] = useState(incFadeDuration); // Adjust based on your preference
    const triggerAnimation = () => {
      // setDuration(0);
      // setFadeOutDuration(0);
      // setIsAnimatingWidth(false);

      // setTimeout(() => {
      //   setDuration(incDuration);
      //   setFadeOutDuration(incFadeDuration);
      //   setIsAnimatingWidth(true);
      // }, 1);
      setIsAnimatingWidth(true);
    };

    useImperativeHandle(ref, () => ({
      triggerAnimation,
    }));

    useEffect(() => {
      if (isAnimatingWidth) {
        const widthAnimationDuration = duration * 1000;

        // Trigger opacity fade-out after width animation completes
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
        className={`absolute left-0 top-0 h-full bg-slate-700/40 ease-linear ${
          isAnimatingWidth
            ? 'pointer-events-none w-full transition-[width]'
            : 'pointer-events-auto w-0'
        } ${
          isFadingOut
            ? `duration-[${fadeOutDuration}ms] opacity-0 transition-opacity`
            : 'opacity-100'
        }`}
        style={{
          transitionDuration: isFadingOut
            ? `${fadeOutDuration}ms`
            : isAnimatingWidth
              ? `${duration}s`
              : '0ms',
          opacity: !(isAnimatingWidth || isFadingOut) ? 0 : '',
        }}
      />
    );
  },
);

export default StatusBar;
