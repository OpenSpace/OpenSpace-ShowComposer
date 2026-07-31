import { useState } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Rnd } from 'react-rnd';
import { ActionIcon, Box } from '@mantine/core';

import { FeedbackPanel } from '@/editor/canvas/panels/FeedbackPanel/FeedbackPanel';
import { FlightControlPanel } from '@/editor/canvas/panels/FlightControlPanel/FlightControlPanel';
import { LogPanel } from '@/editor/canvas/panels/LogPanel/LogPanel';
import { SessionPanel } from '@/editor/canvas/panels/SessionPanel/SessionPanel';
import { TimeDatePicker } from '@/editor/canvas/panels/TimeDatePicker/TimeDatePicker';
import { GripHorizontalIcon, MinusIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import {
  LogComponent,
  NavComponent,
  RecordComponent,
  StatusComponent,
  TimeComponent
} from '@/types/components';
import { roundToNearest } from '@/utils/math';

import classes from './DraggablePanel.module.css';

interface PanelProps {
  component:
    | TimeComponent
    | NavComponent
    | StatusComponent
    | RecordComponent
    | LogComponent;
  originX?: number;
  originY?: number;
}

export default function DraggablePanel({
  component,
  originX = 0,
  originY = 0
}: PanelProps) {
  const position = useBoundStore((state) => state.positions[component.id]);
  const updatePosition = useBoundStore((state) => state.updatePosition);

  const [isDragging, setIsDragging] = useState(false);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  if (!position || !component) return null;

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    setIsDragging(false);
    updatePosition(component.id, {
      x: roundToNearest(d.x, 25),
      y: roundToNearest(d.y, 25)
    });
  };

  const inner = () => {
    switch (component?.type) {
      case 'timepanel':
        return <TimeDatePicker />;
      case 'navpanel':
        return <FlightControlPanel />;
      case 'statuspanel':
        return <FeedbackPanel />;
      case 'recordpanel':
        return <SessionPanel />;
      case 'logpanel':
        return <LogPanel />;
      default:
        return <Box>Unknown type</Box>;
    }
  };

  const minimize = () => {
    updatePosition(component.id, {
      minimized: !position.minimized
    });
  };

  return (
    <Rnd
      dragHandleClassName={'drag-handle'}
      default={{
        x: position?.x,
        y: position?.y,
        width: position?.width,
        height: position?.height
      }}
      position={{
        x: Math.max(position?.x, 0),
        y: Math.max(position?.y, 0)
      }}
      scale={isPresentMode ? 1.0 : scale}
      size={{ width: position?.width, height: position?.height }}
      onDragStart={() => {
        setIsDragging(true);
      }}
      onDragStop={(e: DraggableEvent, d: DraggableData) => handleDragStop(e, d)}
      onResizeStop={() => {}}
      enableResizing={false}
      resizeGrid={[25, 25]}
      minHeight={position?.minHeight || 100}
      minWidth={position.minWidth || 100}
      style={{
        borderRadius: 'var(--mantine-radius-md)',
        outline: 'none',
        color: 'var(--mantine-color-text)',
        background: 'var(--mantine-color-dark-9)',
        boxShadow: isDragging ? 'var(--mantine-shadow-lg)' : 'var(--mantine-shadow-md)',
        opacity: position?.minimized ? 0 : 1,
        pointerEvents: position?.minimized ? 'none' : 'auto',
        zIndex: position?.minimized ? 0 : 99999,
        transformOrigin: `${originX}px ${originY}px`,
        transition: 'opacity 300ms'
      }}
    >
      <Box
        className={`drag-handle ${classes.dragHandle}`}
        style={{
          position: 'absolute',
          top: 0,
          height: 30,
          width: '100%',
          cursor: 'move'
        }}
      >
        <Box
          style={{
            position: 'absolute',
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
        >
          <GripHorizontalIcon className={classes.grip} />
        </Box>
      </Box>
      <Box style={{ position: 'absolute', right: 4, top: 4 }}>
        <ActionIcon variant={'subtle'} size={'sm'} onClick={minimize}>
          <MinusIcon size={16} />
        </ActionIcon>
      </Box>
      <Box style={{ marginTop: 4, padding: 12 }}>{inner()}</Box>
    </Rnd>
  );
}
