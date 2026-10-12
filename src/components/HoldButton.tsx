import { type KeyboardEvent, type ReactNode, useCallback, useEffect } from 'react';
import { ActionIcon, type ActionIconProps } from '@mantine/core';
import { useInterval, useTimeout } from '@mantine/hooks';

interface Props extends ActionIconProps {
  onClick: () => void;
  children: ReactNode;
  /** Time (ms) before the action starts repeating while holding */
  holdDelay?: number;
  /** Time (ms) between each repeat while holding */
  holdInterval?: number;
}

export function HoldButton({
  onClick,
  children,
  holdDelay = 400,
  holdInterval = 50,
  ...props
}: Props) {
  const { start: startRepeat, stop: stopRepeat } = useInterval(onClick, holdInterval);
  const { start: startDelay, clear: clearDelay } = useTimeout(startRepeat, holdDelay);

  const stopHolding = useCallback(() => {
    clearDelay();
    stopRepeat();
  }, [clearDelay, stopRepeat]);

  useEffect(() => {
    // Use an event listener to make it possible to stop holding even if the pointer is
    // released outside of the button
    window.addEventListener('pointerup', stopHolding);
    return () => window.removeEventListener('pointerup', stopHolding);
  }, [stopHolding]);

  function startHolding() {
    onClick();
    startDelay();
  }

  function isActivationKey(event: KeyboardEvent) {
    return event.key === 'Enter' || event.key === ' ';
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!isActivationKey(event)) {
      return;
    }
    // Don't let the button click on key down, we want to handle it ourselves
    event.preventDefault();
    // Don't start holding if the key is being held down, we only want to start on the
    // first key down event
    if (!event.repeat) {
      startHolding();
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (isActivationKey(event)) {
      event.preventDefault();
      stopHolding();
    }
  }

  return (
    <ActionIcon
      {...props}
      onPointerDown={startHolding}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      // If the button loses focus while holding, stop the hold
      onBlur={stopHolding}
    >
      {children}
    </ActionIcon>
  );
}
