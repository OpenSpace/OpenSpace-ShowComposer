import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TitleComponent } from '@/store';
import { throttle } from 'lodash';
import React, { useEffect, useState, useRef } from 'react';

interface TitleGUIProps {
  component: TitleComponent;
}

const TitleGUIComponent: React.FC<TitleGUIProps> = ({ component }) => {
  const [textStyle, setTextStyle] = useState({
    fontSize: '1rem',
    lineHeight: '1.2',
    // visibility: 'visible',
    // position: 'static',
  });
  const containerRef = useRef<HTMLDivElement>(null);

  function measureTextDimensions(
    text: string | null,
    style: {
      fontSize: string;
      lineHeight: string;
      visibility: string; // Hide the element
      // Hide the element
      position: string; // Avoid affecting layout
      // Avoid affecting layout
      whiteSpace: string;
    },
    containerWidth: number,
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
      textHeight: element.offsetHeight,
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
        visibility: 'hidden', // Hide the element
        position: 'absolute', // Avoid affecting layout
        whiteSpace: 'nowrap', // Prevent line breaks during width measurement
      };

      // Assuming measureTextDimensions is a function you've implemented
      const { textWidth, textHeight } = measureTextDimensions(
        component.text,
        trialStyle,
        width - 160,
      );

      if (textWidth <= width && textHeight <= height) {
        minSize = size + precision;
      } else {
        maxSize = size - precision;
      }
    }
    setTextStyle({
      fontSize: `${minSize}px`,
      lineHeight: `${minSize * 1.1}px`,
    });
  }, 250); // 100ms throttle period

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
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
    <div
      ref={containerRef}
      className="absolute right-0 top-0 flex h-full w-full items-center justify-center overflow-hidden text-center"
    >
      <h1
        style={{
          fontSize: textStyle.fontSize,
          lineHeight: textStyle.lineHeight,
          // visibility: textStyle.visibility,
          // position: textStyle.position,
        }}
      >
        {component?.text}
      </h1>
    </div>
  );
};
interface TitleModalProps {
  component: TitleComponent | null;
  handleComponentData: (data: Partial<TitleComponent>) => void;
  isOpen: boolean;
}

const TitleModal: React.FC<TitleModalProps> = ({
  component,
  handleComponentData,
  isOpen,
}) => {
  const [text, setText] = useState(component?.text || '');

  useEffect(() => {
    handleComponentData({ text });
  }, [text, handleComponentData]);

  useEffect(() => {
    if (component) {
      setText(component?.text);
    } else {
      setText('');
    }
  }, [component, setText]);

  useEffect(() => {
    if (!isOpen) {
      setText('');
    }
  }, [isOpen, setText]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Label>Title</Label>
      <Input
        // className="w-full rounded border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {/* </div> */}
    </div>
  );
};

export { TitleModal, TitleGUIComponent };
