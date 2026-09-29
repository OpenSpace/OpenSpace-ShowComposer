import { CSSProperties, ReactNode, useState } from 'react';
import { Props as RndProps, Rnd } from 'react-rnd';
import { Box } from '@mantine/core';

import { GripHorizontalIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';

import { zIndex } from './zIndex';

import classes from './Draggable.module.css';

const DRAG_HANDLE_CLASS = 'drag-handle';

interface Props extends RndProps {
  children: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  dragAnywhere?: boolean;
  dragStyle?: CSSProperties;
}

export function Draggable({
  children,
  leftSection,
  rightSection,
  dragAnywhere = false,
  dragStyle,
  minWidth = 50,
  minHeight = 50,
  resizeGrid = [25, 25],
  disableDragging,
  enableResizing,
  onDragStart,
  onDragStop,
  style,
  ...rndProps
}: Props) {
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const pageScale = useSettingsStore((state) => state.pageScaleThrottled);
  const isDragDisabled = disableDragging ?? isPresentMode;
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Rnd
      {...rndProps}
      dragHandleClassName={dragAnywhere ? '' : DRAG_HANDLE_CLASS}
      resizeGrid={resizeGrid}
      minWidth={minWidth}
      minHeight={minHeight}
      scale={isPresentMode ? 1.0 : pageScale}
      disableDragging={isDragDisabled}
      enableResizing={enableResizing ?? !isPresentMode}
      onDragStart={(e, d) => {
        setIsDragging(true);
        onDragStart?.(e, d);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        onDragStop?.(e, d);
      }}
      style={{
        borderRadius: 'var(--mantine-radius-md)',
        boxShadow: isDragging
          ? '0 10px 24px rgba(0, 0, 0, 0.6)'
          : '0 2px 8px rgba(0, 0, 0, 0.4)',
        ...style,
        ...(isDragging ? dragStyle : {})
      }}
    >
      {!isDragDisabled && (
        <Box
          className={`${DRAG_HANDLE_CLASS} ${classes.handle}`}
          style={{
            position: 'absolute',
            top: 0,
            zIndex: zIndex.dragHandle,
            height: 20,
            width: '100%',
            cursor: 'move'
          }}
        >
          {leftSection && (
            <Box
              style={{
                position: 'absolute',
                left: 8,
                top: 4,
                zIndex: zIndex.handleSection,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {leftSection}
            </Box>
          )}
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <GripHorizontalIcon className={classes.grip} />
          </Box>
          {rightSection && (
            <Box
              style={{
                position: 'absolute',
                right: 4,
                top: 4,
                zIndex: zIndex.handleSection,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {rightSection}
            </Box>
          )}
        </Box>
      )}
      {children}
    </Rnd>
  );
}
