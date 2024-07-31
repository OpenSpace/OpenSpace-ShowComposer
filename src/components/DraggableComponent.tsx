// DraggableComponent.tsx
import React, { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Rnd } from 'react-rnd';
import { DraggableEvent, DraggableData } from 'react-draggable';
import {
  useComponentStore,
  Component,
  TitleComponent,
  useSettingsStore,
  SetTimeComponent as SetTimeType,
  FadeComponent,
  FlyToComponent,
  SetFocusComponent,
  BooleanComponent,
  TriggerComponent,
  NumberComponent,
  VideoComponent,
  RichTextComponent,
  MultiComponent,
  ImageComponent,
} from '@/store';
import { roundToNearest } from '@/utils/math';
import { TitleGUIComponent } from './types/static/Title';
import DropdownMenuComponent from './DropdownMenu';
import TimeDatePicker from './types/static/TimeDatePicker';
import { SetTimeComponent } from './types/preset/SetTime';
import FlightControlPanel from './types/static/FlightControlPanel';
import { FlyToGUIComponent } from './types/preset/FlyTo';
import { FadeGUIComponent } from './types/preset/Fade';
import { FocusComponent } from './types/preset/Focus';
import { BoolGUIComponent } from './types/property/Boolean';
import { TriggerGUIComponent } from './types/property/Trigger';
import { NumberGUIComponent } from './types/property/Number';
import { VideoGUIComponent } from './types/static/Video';
import { RichTextGUIComponent } from './types/static/RichText';
import { MultiGUIComponent } from './types/preset/Multi';
import { Edit2, GripHorizontal, Trash2 } from 'lucide-react';
import { ImageGUIComponent } from './types/static/Image';

interface DraggableComponentProps {
  component: Component;
  onEdit: () => void;
  onDelete: () => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onEdit,
  onDelete,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const tempPosition = useComponentStore(
    (state) => state.tempPositions[component.id],
  );
  const setTempPositions = useComponentStore((state) => state.setTempPositions);
  const setTempPosition = useComponentStore((state) => state.setTempPosition);
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const getComponentById = useComponentStore((state) => state.getComponentById);

  const selectedComponents = useComponentStore(
    (state) => state.selectedComponents,
  );
  const selectComponent = useComponentStore((state) => state.selectComponent);
  const deselectComponent = useComponentStore(
    (state) => state.deselectComponent,
  );

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    setIsDragging(false);
    if (selectedComponents.includes(component.id)) {
      const deltaX = d.x - component.x;
      const deltaY = d.y - component.y;
      selectedComponents.forEach((id) => {
        const comp = getComponentById(id);
        if (comp) {
          updateComponent(id, {
            x: roundToNearest(comp.x + deltaX, 25),
            y: roundToNearest(comp.y + deltaY, 25),
          });
        }
      });
    } else {
      updateComponent(component.id, {
        x: roundToNearest(d.x, 25),
        y: roundToNearest(d.y, 25),
      });
    }
    setTempPositions({});
    // checkOverlap({ ...component, x: d.x, y: d.y });
  };

  const handleClick = (e: React.MouseEvent) => {
    // if (isDragging) return;
    if (e.shiftKey) {
      if (selectedComponents.includes(component.id)) {
        deselectComponent(component.id);
      } else {
        selectComponent(component.id);
      }
      e.stopPropagation();
    }
  };

  let content;
  switch (component?.type) {
    case 'title':
      content = <TitleGUIComponent component={component as TitleComponent} />;
      break;
    case 'video':
      content = <VideoGUIComponent component={component as VideoComponent} />;
      break;
    case 'image':
      content = <ImageGUIComponent component={component as ImageComponent} />;
      break;
    case 'richtext':
      content = (
        <RichTextGUIComponent component={component as RichTextComponent} />
      );
      break;
    case 'timepanel':
      content = <TimeDatePicker />;
      // content = <SimulationIncrement />;
      // content = <div>Unknown component type</div>;
      break;
    case 'settime':
      content = <SetTimeComponent component={component as SetTimeType} />;
      break;
    case 'navpanel':
      content = <FlightControlPanel />;
      break;
    case 'flyto':
      content = <FlyToGUIComponent component={component as FlyToComponent} />;
      break;
    case 'fade':
      content = <FadeGUIComponent component={component as FadeComponent} />;
      break;
    case 'setfocus':
      content = <FocusComponent component={component as SetFocusComponent} />;
      break;
    case 'boolean':
      content = <BoolGUIComponent component={component as BooleanComponent} />;
      break;
    case 'number':
      content = <NumberGUIComponent component={component as NumberComponent} />;
      break;
    case 'trigger':
      content = (
        <TriggerGUIComponent component={component as TriggerComponent} />
      );
      break;
    case 'multi':
      content = <MultiGUIComponent component={component as MultiComponent} />;
      break;
    default:
      content = <div>Unknown component type</div>;
      break;
  }
  // const isOverlapped = overlappedComponents[component?.id]?.length > 0;
  const isSelected = selectedComponents.includes(component?.id);
  const isMultiLoading = component?.isMulti?.includes('pending');
  const isHidden = component?.isMulti?.includes('true');

  const getComponentPosition = () => {
    return tempPosition || { x: component?.x, y: component?.y };
  };

  return (
    <>
      <Rnd
        dragHandleClassName={isSelected ? '' : 'drag-handle'}
        default={{
          x: component?.x,
          y: component?.y,
          width: component?.width,
          height: component?.height,
        }}
        position={getComponentPosition()}
        size={{ width: component?.width, height: component?.height }}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDrag={(_e: DraggableEvent, d: DraggableData) => {
          if (selectedComponents.includes(component?.id)) {
            const deltaX = d.x - component?.x;
            const deltaY = d.y - component?.y;
            selectedComponents.forEach((id) => {
              const comp = getComponentById(id);
              if (comp) {
                setTempPosition(id, comp.x + deltaX, comp.y + deltaY);
              }
            });
          }
        }}
        onDragStop={(e: DraggableEvent, d: DraggableData) =>
          handleDragStop(e, d)
        }
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          console.log(_delta);
          console.log(
            'onResizeStop',
            parseInt(ref.style.width),
            ref.style.height,
          );
          console.log(
            'onResizeStop',
            roundToNearest(position.x, 25),
            roundToNearest(position.y, 25),
          );
          updateComponent(component.id, {
            width: roundToNearest(parseInt(ref.style.width), 25),
            height: roundToNearest(parseInt(ref.style.height), 25),
            x: roundToNearest(position.x, 25),
            y: roundToNearest(position.y, 25),
          });
          // checkOverlap({ ...component, x: position.x, y: position.y });
        }}
        disableDragging={isPresentMode} // Conditionally disable dragging
        enableResizing={!isPresentMode ? true : false} // Conditionally disable resizing
        // resizeGrid={[25, 25]}
        minHeight={component?.minHeight || 100}
        minWidth={component?.minWidth || 100}
        // bounds="parent"
        onClick={handleClick}
        style={{
          zIndex: isSelected ? 50 : 1,
        }}
        className={`
          ${isHidden ? '!hidden' : ''}
          ${
            isPresentMode
              ? 'border bg-opacity-0'
              : 'border-0 bg-gray-300 bg-opacity-25'
          }
          absolute cursor-move rounded-lg ${
            isDragging || isSelected ? 'z-50 border-blue-500 shadow-lg ' : ''
          } 
          rounded-lg 
          ${isMultiLoading ? 'opacity-25' : 'opacity-100'}
          `}
        // transition-colors duration-300
        //
      >
        {!isPresentMode && (
          <div className="drag-handle transition-color group absolute z-[99] flex h-[30px] w-full  cursor-move items-center justify-end rounded-t-lg bg-slate-500/0  duration-300 hover:bg-slate-900/40 ">
            <div className="absolute flex w-full flex-col items-center justify-center gap-1">
              <GripHorizontal
                className={`stroke-slate-500 transition-colors duration-300 group-hover:stroke-white   ${
                  isSelected ? 'stroke-white' : ''
                }`}
              />
            </div>
            <div className="absolute right-1.5 top-1.5">
              <DropdownMenuComponent
                // className="w-0"
                items={[
                  <div
                    className="flex w-full  flex-row items-center justify-between gap-2 "
                    onClick={onEdit}
                  >
                    <span>Edit</span>
                    <Edit2 className="h-4 w-4 " />
                  </div>,
                  <div
                    className="flex w-full flex-row items-center justify-between gap-2"
                    onClick={handleDeleteClick}
                  >
                    <span>Delete</span>
                    <Trash2 className="h-4 w-4" />
                  </div>,
                ]}
              />
            </div>
          </div>
        )}
        <div className="relative top-0 z-0 flex h-full flex-col items-center justify-center rounded-lg p-4">
          {content}
        </div>
      </Rnd>
      <div
        className="relative left-0 top-0 h-full w-full"
        style={{ pointerEvents: isDeleteModalOpen ? 'all' : 'none' }}
      >
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          message={`Are you sure you want to delete the component${
            component?.gui_name ? ' ' + component?.gui_name : ''
          }?`}
        />
      </div>
    </>
  );
};

export default DraggableComponent;
