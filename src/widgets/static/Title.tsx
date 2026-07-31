import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Center } from '@mantine/core';
import { throttle } from 'lodash';

import { TitleComponent } from '@/store';

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 1000;
// Total horizontal space kept clear around the text so it doesn't touch the box
// edges (split across both sides, since the rendered title is centered)
const HORIZONTAL_PADDING = 160;

/**
 * The largest font size (in pixels) at which `text`, wrapped to the box width, still
 * fits within `boxWidth` × `boxHeight`. Binary-searches on one hidden measuring
 * element, reused across iterations rather than re-created each step.
 *
 * @param text - The title text to measure.
 * @param boxWidth - Width of the container the text must fit within, in pixels.
 * @param boxHeight - Height of the container the text must fit within, in pixels.
 * @returns The fitted font size, in pixels.
 */
function calculateMaxFontSize(text: string, boxWidth: number, boxHeight: number) {
  const span = document.createElement('span');

  Object.assign(span.style, {
    position: 'absolute',
    visibility: 'hidden',
    display: 'inline-block',
    whiteSpace: 'normal',
    width: `${boxWidth - HORIZONTAL_PADDING}px`
  });

  span.textContent = text;
  document.body.appendChild(span);

  // Binary search the largest font size that fits within the box.
  // min and max converge to the largest size that fits within the box
  let min = MIN_FONT_SIZE;
  let max = MAX_FONT_SIZE;
  while (max - min > 0.01) {
    const size = (min + max) / 2;
    span.style.fontSize = `${size}px`;
    span.style.lineHeight = `${size * 1.1}px`;

    const isOverflowing = span.offsetWidth > boxWidth || span.offsetHeight > boxHeight;
    // Font size is too large; the box is overflowing. Use lower half of the searchspace
    if (isOverflowing) {
      max = size;
    } else {
      // Font size fits; use upper half of the searchspace
      min = size;
    }
  }
  // Remove from DOM
  document.body.removeChild(span);
  return min;
}

interface TitleGUIProps {
  component: TitleComponent;
}

function TitleGUIComponent({ component }: TitleGUIProps) {
  const [fontSize, setFontSize] = useState(16);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-fit the font whenever the box resizes. Throttled (resize fires rapidly during
  // drag) and memoized on the text so the effect has a stable dependency and the title
  // re-fits when its text changes
  const throttledFit = useMemo(
    () =>
      throttle((width: number, height: number) => {
        setFontSize(calculateMaxFontSize(component.text, width, height));
      }, 250),
    [component.text]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      throttledFit(width, height);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [throttledFit]);

  return (
    <Center
      ref={containerRef}
      pos={'absolute'}
      top={0}
      right={0}
      h={'100%'}
      w={'100%'}
      style={{ overflow: 'hidden', textAlign: 'center' }}
    >
      <Box
        component={'h1'}
        style={{
          fontSize,
          lineHeight: 1.1,
          color: 'var(--mantine-color-white)'
        }}
      >
        {component?.text}
      </Box>
    </Center>
  );
}

export { TitleGUIComponent };
