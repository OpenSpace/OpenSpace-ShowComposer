import { useCallback, useEffect, useRef, useState } from 'react';
import { Flex, Progress } from '@mantine/core';
import { throttle } from 'lodash';

interface Props {
  progress: number; // Float value between 0 and 1
  debounceDuration: number; // Duration in milliseconds
}

function StatusBarControlled({ progress, debounceDuration }: Props) {
  const [, setProgress] = useState(progress);
  const [, setIsFadingOut] = useState(false);
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
    <Flex
      pos={'absolute'}
      top={0}
      left={0}
      h={'100%'}
      w={'100%'}
      direction={'column'}
      justify={'flex-end'}
      p={'md'}
      style={{ borderRadius: 'var(--mantine-radius-lg)' }}
    >
      <Progress
        value={(Math.round(progress * 1000) / 1000) * 100}
        size={'xl'}
        radius={'xl'}
        transitionDuration={150}
        styles={{
          root: { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
          section: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            transitionTimingFunction: 'linear'
          }
        }}
      />
    </Flex>
  );
}

export { StatusBarControlled };
