import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { DraggableEvent, DraggableData } from 'react-draggable';
// import { Button } from '@/pages/ui/button';
import { GripHorizontal, LockOpen, Lock } from 'lucide-react';
import { Page } from '@/store/componentsStore';
import { useComponentStore, useSettingsStore } from '@/store';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import ButtonLabel from './common/ButtonLabel';
import { getCopy } from '@/utils/copyHelpers';
const AdjustablePage: React.FC = () => {
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state
  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const updatePage = useComponentStore((state) => state.updatePage);
  const page: Page = useComponentStore((state) =>
    state.getPageById(state.currentPage),
  );
  const currentPageIndex = useComponentStore((state) => state.currentPageIndex);
  const updatePageSize = useSettingsStore((state) => state.updatePageSize);
  const [isDragging, setIsDragging] = useState(false);
  const [locked, setLocked] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    // Show the label when pageWidth or pageHeight changes
    setIsVisible(true);
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [pageWidth, pageHeight, locked]);
  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    console.log(_e);
    setIsDragging(false);
    updatePage(page.id, {
      x: d.x,
      y: d.y,
    });
  };
  return (
    <Rnd
      //   dragHandleClassName={'drag-handle'}
      scale={isPresentMode ? 1.0 : scale}
      default={{
        x: page.x,
        y: page.y,
        width: pageWidth,
        height: pageHeight,
      }}
      position={{
        x: page.x,
        y: page.y,
      }}
      size={{
        width: pageWidth,
        height: pageHeight,
      }}
      onDragStart={(e: DraggableEvent) => {
        setIsDragging(true);
        e.stopPropagation();
      }}
      bounds="parent"
      onDragStop={(e: DraggableEvent, d: DraggableData) => handleDragStop(e, d)}
      onResize={(_e, _direction, ref, _delta, position) => {
        updatePageSize(parseInt(ref.style.width), parseInt(ref.style.height));
        updatePage(page.id, {
          x: position.x,
          y: position.y,
        });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updatePageSize(parseInt(ref.style.width), parseInt(ref.style.height));
        updatePage(page.id, {
          x: position.x,
          y: position.y,
        });
      }}
      disableDragging={locked || isPresentMode} // Conditionally disable dragging
      enableResizing={!locked && !isPresentMode} // Conditionally disable resizing
      style={{
        zIndex: 0,
        // transformOrigin: '0px 0px',
      }}
      //   data-state={page?.minimized ? 'closed' : 'open'}
      // data-side="top"
      className={`absolute cursor-move ${
        isDragging ? 'z-50 border-blue-500 shadow-lg' : ''
      } 
      ${
        isPresentMode
          ? 'border-0 dark:bg-slate-200/0'
          : locked
            ? 'pointer-events-none border-2  border-dashed border-slate-700/30 bg-slate-200/60 dark:border-slate-200/30 dark:bg-slate-200/5'
            : 'pointer-events-auto  border-2  border-dashed border-slate-700/80 bg-slate-200/60 dark:border-slate-200 dark:bg-slate-200/10'
      } }
        data=[state=open]:opacity-100
        group 
        text-slate-950  
        shadow-slate-800
        outline-none dark:border-slate-50
        dark:text-slate-50
        dark:shadow-slate-500/50
      `}
    >
      <div className="drag-handle  absolute top-0 h-[30px] w-full cursor-move">
        {!isPresentMode && !locked && (
          <div className="absolute flex w-full flex-col items-center justify-center gap-1">
            <GripHorizontal
              className={`stroke-slate-700/40 transition-colors  duration-300 group-hover:stroke-slate-800 dark:stroke-slate-500 dark:group-hover:stroke-white`}
            />
          </div>
        )}
        {!isPresentMode && (
          <>
            {!locked && (
              <div className="absolute right-14 top-3">
                <ButtonLabel
                  className={`${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  } text-xs text-slate-700 transition-opacity duration-500 dark:text-slate-200`}
                >
                  {pageWidth} x {pageHeight}
                </ButtonLabel>
              </div>
            )}
            <div className="absolute left-3 top-3">
              <ButtonLabel className="text-xs text-slate-700 dark:text-slate-200">
                {getCopy('AdjustablePage', 'page')} {currentPageIndex + 1}
              </ButtonLabel>
            </div>
            <div className="pointer-events-auto absolute right-3 top-3 z-[999]">
              <Tooltip>
                <TooltipContent>
                  {locked ? 'Unlock Page' : 'Lock Page'}
                </TooltipContent>

                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    // pressed={isPresentMode}
                    onClick={() => setLocked(!locked)}
                    className={`z-50 p-1 transition-opacity duration-100 ${
                      locked ? 'opacity-60' : 'opacity-100'
                    }`}
                  >
                    {locked ? (
                      <Lock size="16" />
                    ) : (
                      <LockOpen
                        size="16"
                        // className={isPresentMode ? 'stroke-zinc-700/100' : 'stroke-zinc-700/70'}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
};
export default AdjustablePage;
