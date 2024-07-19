// DroppableWorkspace.tsx
import { useComponentStore, useSettingsStore } from '@/store';
import React from 'react';
import SelectionTool from '@/components/SelectionTool';
import { Badge } from './ui/badge';
import { Ellipsis } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import PresentModeToggle from './PresentModeToggle';

const DroppableWorkspace: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state
  const addPage = useComponentStore((state) => state.addPage);
  const deletePage = useComponentStore((state) => state.deletePage);
  const currentPage = useComponentStore((state) => state.currentPage);
  // const [zoomLevel, setZoomLevel] = useState(1); // 1 means 100%
  // const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  // const [showTooltip, setShowTooltip] = useState(false);

  // const handleWheel = useCallback(
  //   (e: React.WheelEvent) => {
  //     e.preventDefault();
  //     const zoomChange = e.deltaY * -0.01;
  //     const newZoomLevel = Math.min(Math.max(zoomLevel + zoomChange, 0.5), 2.0);
  //     setZoomLevel(newZoomLevel);
  //     setShowTooltip(true);
  //     setTimeout(() => setShowTooltip(false), 2000); // Hide tooltip after 2 seconds
  //   },
  //   [zoomLevel],
  // );

  // const handleMouseDown = useCallback(
  //   (e: React.MouseEvent) => {
  //     const startX = e.clientX - panPosition.x;
  //     const startY = e.clientY - panPosition.y;

  //     const handleMouseMove = (e: MouseEvent) => {
  //       setPanPosition({
  //         x: e.clientX - startX,
  //         y: e.clientY - startY,
  //       });
  //     };

  //     const handleMouseUp = () => {
  //       document.removeEventListener('mousemove', handleMouseMove);
  //       document.removeEventListener('mouseup', handleMouseUp);
  //     };

  //     document.addEventListener('mousemove', handleMouseMove);
  //     document.addEventListener('mouseup', handleMouseUp);
  //   },
  //   [panPosition],
  // );

  return (
    <>
      <div
        className="relative h-full w-full rounded-lg border "
        style={{
          overflow: 'hidden',
          backgroundPosition: '-12.5px -12.5px',
          backgroundSize: '25px 25px',
          backgroundImage: !isPresentMode
            ? 'radial-gradient(circle,#404040 1px, #f1f5f9 1px)'
            : undefined,
          transformOrigin: 'top left',
          transition: 'transform 0.2s',
        }}
      >
        <div
          className={`absolute right-3 top-3 flex flex-row gap-2 transition-opacity  ${
            isPresentMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <PresentModeToggle />
          {!isPresentMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="z-[999999]">
                <Button
                  // className="absolute "
                  size="icon"
                  variant="outline"
                >
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => addPage()}>
                  Add Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deletePage(currentPage)}>
                  Delete Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <Badge
          variant="outline"
          className=" absolute left-3 top-3 gap-2 bg-white/70"
        >
          {isPresentMode ? 'Show Mode' : 'Edit Mode'}
        </Badge>

        {!isPresentMode && <SelectionTool />}
        {children}
      </div>
      {/* {showTooltip && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
          }}
        >
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      )} */}
    </>
  );
};

export default DroppableWorkspace;
