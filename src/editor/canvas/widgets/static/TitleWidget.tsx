import { useLayoutEffect, useState } from 'react';
import { Center, Title } from '@mantine/core';
import { useElementSize, useThrottledCallback } from '@mantine/hooks';

import type { TitleComponent } from '@/store';

const MIN_FONT_SIZE = 1;
const MAX_FONT_SIZE = 1000;
// Space kept clear around the text so it doesn't touch the box edges
const HORIZONTAL_PADDING = 40;
const VERTICAL_PADDING = 10;

/**
 * The largest font size (in pixels) at which `text`, wrapped to the available width,
 * still fits within the available width and height. Binary-searches on one hidden
 * element, reused across iterations rather than re-created each step. The element is
 * added to the container, so that it gets the same font and line height as the title.
 *
 * @param container - The element the title is rendered in.
 * @param text - The title text to measure.
 * @param availableWidth - Width the text must fit within, in pixels.
 * @param availableHeight - Height the text must fit within, in pixels.
 * @returns The font size, in pixels.
 */
function calculateMaxFontSize(
  container: HTMLElement,
  text: string,
  availableWidth: number,
  availableHeight: number
) {
  const span = document.createElement('span');

  Object.assign(span.style, {
    position: 'absolute',
    visibility: 'hidden',
    display: 'inline-block',
    whiteSpace: 'normal',
    // Clipped so that text that overflows the span does not change the scroll size of
    // the elements around it
    overflow: 'hidden',
    width: `${availableWidth}px`,
    height: `${availableHeight}px`
  });

  span.textContent = text;
  container.appendChild(span);

  try {
    // min and max converge to the largest size that fits
    let min = MIN_FONT_SIZE;
    let max = MAX_FONT_SIZE;
    while (max - min > 0.5) {
      const size = (min + max) / 2;
      span.style.fontSize = `${size}px`;

      // The span has a fixed size, so offsetWidth and offsetHeight never grow. scrollWidth
      // and scrollHeight do, when the content (e.g. a word that can't wrap) is larger
      const isOverflowing =
        span.scrollWidth > availableWidth || span.scrollHeight > availableHeight;

      // Font size is too large. Use lower half of the searchspace
      if (isOverflowing) {
        max = size;
      } else {
        // Font size fits; use upper half of the searchspace
        min = size;
      }
    }
    return min;
  } finally {
    // Remove from DOM
    container.removeChild(span);
  }
}

interface Props {
  component: TitleComponent;
}

export function TitleWidget({ component }: Props) {
  const [fontSize, setFontSize] = useState(16);
  // No type argument, the ref type the hook returns does not match React 18's ref prop
  const { ref, width, height } = useElementSize();

  // Throttled since the size changes rapidly while the widget is resized
  const fitFont = useThrottledCallback(
    (availableWidth: number, availableHeight: number) => {
      if (ref.current) {
        setFontSize(
          calculateMaxFontSize(
            ref.current,
            component.text,
            availableWidth,
            availableHeight
          )
        );
      }
    },
    250
  );

  // Re-fit the font whenever the box resizes, or when the text changes. The size is the
  // border box, so the padding is removed. It is 0 until the box has been measured.
  // Use useLayoutEffect so we get the correct font size first paint
  useLayoutEffect(() => {
    if (width > 0 && height > 0) {
      fitFont(width - HORIZONTAL_PADDING * 2, height - VERTICAL_PADDING * 2);
    }
  }, [fitFont, width, height, component.text]);

  return (
    <Center
      ref={ref}
      pos={'absolute'}
      top={0}
      right={0}
      h={'100%'}
      w={'100%'}
      px={`${HORIZONTAL_PADDING}px`}
      py={`${VERTICAL_PADDING}px`}
      ta={'center'}
      fw={700}
    >
      <Title
        order={1}
        c={'white'}
        ff={'inherit'} // Inherit in the title so that we use the same title stylings as in the span above
        fw={'inherit'}
        lh={'inherit'}
        fz={`${fontSize}px`}
      >
        {component.text}
      </Title>
    </Center>
  );
}
