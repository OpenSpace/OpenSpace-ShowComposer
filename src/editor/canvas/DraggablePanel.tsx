import { DraggableData, DraggableEvent } from 'react-draggable';
import { ActionIcon, Box } from '@mantine/core';

import { DimmableBody } from '@/editor/canvas/DimmableBody';
import { Draggable } from '@/editor/canvas/Draggable';
import { FeedbackPanel } from '@/editor/canvas/panels/FeedbackPanel/FeedbackPanel';
import { FlightControlPanel } from '@/editor/canvas/panels/FlightControlPanel/FlightControlPanel';
import { LogPanel } from '@/editor/canvas/panels/LogPanel/LogPanel';
import { SessionPanel } from '@/editor/canvas/panels/SessionPanel/SessionPanel';
import { TimeDatePicker } from '@/editor/canvas/panels/TimeDatePicker/TimeDatePicker';
import { zIndex } from '@/editor/canvas/zIndex';
import { useIsConnected } from '@/hooks/util';
import { MinusIcon } from '@/icons/icons';
import { useBoundStore } from '@/store/boundStore';
import {
  LogComponent,
  NavComponent,
  RecordComponent,
  StatusComponent,
  TimeComponent
} from '@/types/components';
import { roundToNearest } from '@/utils/math';

interface Props {
  component:
    | TimeComponent
    | NavComponent
    | StatusComponent
    | RecordComponent
    | LogComponent;
  originX?: number;
  originY?: number;
}

export function DraggablePanel({ component, originX = 0, originY = 0 }: Props) {
  const position = useBoundStore((state) => state.positions[component.id]);
  const updatePosition = useBoundStore((state) => state.updatePosition);

  // isConnected drives the disabled state
  const isConnected = useIsConnected();

  if (!position || !component) return null;

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
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
    <Draggable
      position={{
        x: Math.max(position?.x, 0),
        y: Math.max(position?.y, 0)
      }}
      size={{ width: position?.width, height: position?.height }}
      onDragStop={(e: DraggableEvent, d: DraggableData) => handleDragStop(e, d)}
      disableDragging={false}
      enableResizing={false}
      rightSection={
        <ActionIcon variant={'subtle'} size={'sm'} onClick={minimize}>
          <MinusIcon size={16} />
        </ActionIcon>
      }
      style={{
        background: 'var(--mantine-color-dark-9)',
        color: 'var(--mantine-color-text)',
        outline: 'none',
        opacity: position?.minimized ? 0 : 1,
        pointerEvents: position?.minimized ? 'none' : 'auto',
        zIndex: position?.minimized ? 0 : zIndex.panel,
        transformOrigin: `${originX}px ${originY}px`,
        transition: 'opacity 300ms'
      }}
    >
      <DimmableBody inactive={!isConnected}>
        <Box style={{ marginTop: 4, padding: 12 }}>{inner()}</Box>
      </DimmableBody>
    </Draggable>
  );
}
