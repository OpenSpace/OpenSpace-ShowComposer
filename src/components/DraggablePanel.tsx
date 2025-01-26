import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { DraggableEvent, DraggableData } from 'react-draggable';
import TimeDatePicker from './types/static/TimeDatePicker';
import { Button } from '@/components/ui/button';
import { Minus, GripHorizontal } from 'lucide-react';
import {
  TimeComponent,
  NavComponent,
  StatusComponent,
  RecordComponent,
} from '@/store/ComponentTypes';
import { useSettingsStore } from '@/store';
import { roundToNearest } from '@/utils/math';
import FlightControlPanel from './types/static/FlightControlPanel';
import FeedbackPanel from './FeedbackPanel';
import RecordPanel from './types/static/SessionPanel';
import { cn } from '@/lib/utils';
import { useBoundStore } from '@/store/boundStore';
interface PanelProps {
  component: TimeComponent | NavComponent | StatusComponent | RecordComponent;
  originX?: number;
  originY?: number;
}

const DraggablePanel: React.FC<PanelProps> = ({
  component,
  originX = 0,
  originY = 0,
}) => {
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
      y: roundToNearest(d.y, 25),
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
        return <RecordPanel />;
      default:
        return <div>Unknown type</div>;
    }
  };

  const minimize = () => {
    updatePosition(component.id, {
      minimized: !position.minimized,
    });
  };

  return (
    <Rnd
      dragHandleClassName={'drag-handle'}
      default={{
        x: position?.x,
        y: position?.y,
        width: position?.width,
        height: position?.height,
      }}
      position={{
        x: Math.max(position?.x, 0),
        y: Math.max(position?.y, 0),
      }}
      scale={isPresentMode ? 1.0 : scale}
      size={{ width: position?.width, height: position?.height }}
      onDragStart={() => {
        setIsDragging(true);
      }}
      onDragStop={(e: DraggableEvent, d: DraggableData) => handleDragStop(e, d)}
      onResizeStop={(_e, _direction, _ref, _delta, _position) => {}}
      enableResizing={false} // Conditionally disable resizing
      resizeGrid={[25, 25]}
      minHeight={position?.minHeight || 100}
      minWidth={position.minWidth || 100}
      style={{
        zIndex: 50,
        transformOrigin: `${originX}px ${originY}px`,
      }}
      data-state={position?.minimized ? 'closed' : 'open'}
      className={cn(
        'absolute cursor-move',
        'data=[state=open]:opacity-100 rounded-md border-slate-200',
        'bg-gray-300 bg-opacity-75 text-slate-950 shadow-md outline-none',
        'transition-opacity duration-300 data-[state=closed]:pointer-events-none',
        'data-[state=open]:pointer-events-auto data-[state=closed]:opacity-0',
        'dark:border dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
        isDragging ? 'z-50 border-blue-500 shadow-lg' : '',
      )}
    >
      <div className="drag-handle group absolute top-0 h-[30px] w-full cursor-move">
        <div className="absolute flex w-full flex-col items-center justify-center gap-1">
          <GripHorizontal
            className={`stroke-slate-500 transition-colors duration-300 group-hover:stroke-white`}
          />
        </div>
      </div>
      <div className="absolute right-1 top-1 ">
        <Button
          variant="ghost"
          size="icon"
          className="m-0 h-4 w-4 p-0"
          onClick={minimize}
        >
          <Minus size="20" />
        </Button>
      </div>
      <div className="mt-1 p-3">{inner()}</div>
    </Rnd>
  );
};

export default DraggablePanel;
