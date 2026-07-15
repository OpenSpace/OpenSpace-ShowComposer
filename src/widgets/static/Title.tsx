import { useEffect, useRef, useState } from 'react';
import { Box, Center, Group, InputLabel, Stack, TextInput } from '@mantine/core';
import { throttle } from 'lodash';

import Toggle from '@/components/Toggle';
import { TitleComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

interface TitleGUIProps {
  component: TitleComponent;
}

function TitleGUIComponent({ component }: TitleGUIProps) {
  const [textStyle, setTextStyle] = useState({
    fontSize: '1rem',
    lineHeight: '1.2'
  });
  const containerRef = useRef<HTMLDivElement>(null);
  function measureTextDimensions(
    text: string | null,
    style: {
      fontSize: string;
      lineHeight: string;
      visibility: string;
      position: string;
      whiteSpace: string;
    },
    containerWidth: number
  ) {
    // Create a temporary element for the text
    const element = document.createElement('span');
    element.textContent = text;

    // Apply the provided styles to the element
    Object.assign(element.style, style);

    // Set the width to match the container's width to simulate wrapping
    element.style.width = `${containerWidth}px`;

    // Additional styles to ensure accurate measurement
    element.style.whiteSpace = 'normal'; // Allow line breaks for accurate height measurement
    element.style.display = 'inline-block'; // Ensure the element wraps text correctly
    element.style.visibility = 'hidden'; // Hide the element during measurement
    document.body.appendChild(element);

    // Measure the element
    const dimensions = {
      textWidth: element.offsetWidth,
      textHeight: element.offsetHeight
    };

    // Clean up by removing the element from the document
    document.body.removeChild(element);
    return dimensions;
  }
  const throttledMeasureAndApply = throttle((width, height) => {
    let minSize = 12,
      maxSize = 1000;
    const precision = 0.01;
    let size = (minSize + maxSize) / 2;
    while (maxSize - minSize > precision) {
      size = (minSize + maxSize) / 2;
      const trialStyle = {
        fontSize: `${size}px`,
        lineHeight: `${size * 1.1}px`,
        visibility: 'hidden',
        // Hide the element
        position: 'absolute',
        // Avoid affecting layout
        whiteSpace: 'nowrap' // Prevent line breaks during width measurement
      };

      // Assuming measureTextDimensions is a function you've implemented
      const { textWidth, textHeight } = measureTextDimensions(
        component.text,
        trialStyle,
        width - 160
      );
      if (textWidth <= width && textHeight <= height) {
        minSize = size + precision;
      } else {
        maxSize = size - precision;
      }
    }
    setTextStyle({
      fontSize: `${minSize}px`,
      lineHeight: `${minSize * 1.1}px`
    });
  }, 250); // 100ms throttle period

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        throttledMeasureAndApply(width, height);
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);
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
          fontSize: textStyle.fontSize,
          lineHeight: textStyle.lineHeight,
          color: 'light-dark(var(--mantine-color-black), var(--mantine-color-white))'
        }}
      >
        {component?.text}
      </Box>
    </Center>
  );
}

interface TitleModalProps {
  component: TitleComponent | null;
  handleComponentData: (data: Partial<TitleComponent>) => void;
  isOpen: boolean;
}

function TitleModal({ component, handleComponentData, isOpen }: TitleModalProps) {
  const currentPageTitle = useBoundStore(
    (state) => state.getPageById(state.currentPage).name
  );
  const [text, setText] = useState(
    component?.text || (component?.setFromPageTitle ? currentPageTitle : '')
  );
  const [setFromPageTitle, setSetFromPageTitle] = useState<boolean>(
    component?.setFromPageTitle || true
  );
  useEffect(() => {
    handleComponentData({
      text,
      setFromPageTitle
    });
  }, [text, setFromPageTitle, handleComponentData]);

  useEffect(() => {
    if (setFromPageTitle) {
      setText(currentPageTitle);
    }
  }, [setFromPageTitle, currentPageTitle]);

  useEffect(() => {
    if (component) {
      setText(component?.text);
      setSetFromPageTitle(component?.setFromPageTitle || true);
    } else {
      setText(currentPageTitle);
      setSetFromPageTitle(true);
    }
  }, [component, setText]);

  useEffect(() => {
    if (!isOpen) {
      setText('');
      setSetFromPageTitle(true);
    }
  }, [isOpen, setText]);
  return (
    <Stack gap={'md'}>
      <InputLabel>{getCopy('Title', 'title')}</InputLabel>
      <TextInput value={text} onChange={(e) => setText(e.currentTarget.value)} />
      <Group gap={'xs'}>
        <InputLabel>{getCopy('Title', 'pageTitle')}</InputLabel>
        <Toggle
          value={setFromPageTitle}
          setValue={(value) => setSetFromPageTitle(value)}
        />
      </Group>
    </Stack>
  );
}

export { TitleGUIComponent, TitleModal };
