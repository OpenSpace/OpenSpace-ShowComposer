import { useEffect, useRef, useState } from 'react';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import ComponentModal from './components/ComponentModal';
import DraggableComponent from './components/DraggableComponent';
import DroppableWorkspace from './components/DroppableWorkspace';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  // ImperativePanelHandle,
} from '@/components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  // TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Save, Folder, Trash2, Settings } from 'lucide-react';

import {
  ComponentType,
  loadStore,
  saveStore,
  useComponentStore,
  useSettingsStore,
} from './store';

import { v4 as uuidv4 } from 'uuid';
// import PresentModeToggle from './components/PresentModeToggle';
// import SettingsMenu from './components/SettingsMenu';
import {
  ConnectionSettings,
  ConnectionStatus,
} from './components/ConnectionSettings';
import SubscriptionPanel from './components/SubscriptionPanel';
import BottomDrawer from './components/common/BottomDrawer';
import Pagination from './components/Pagination';
import { MultiComponent, MultiState } from './store/componentsStore';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottombarOpen, setIsBottombarOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [currentComponentId, setCurrentComponentId] = useState<string | null>(
    null,
  );
  const [currentComponentType, setCurrentComponentType] = useState<
    ComponentType | ''
  >('');

  const components = useComponentStore((state) => state.components);
  const getComponentById = useComponentStore((state) => state.getComponentById);
  const removeAllComponents = useComponentStore(
    (state) => state.removeAllComponents,
  );
  const removeComponent = useComponentStore((state) => state.removeComponent);
  const addComponent = useComponentStore((state) => state.addComponent);
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const addPage = useComponentStore((state) => state.addPage);
  const getPageById = useComponentStore((state) => state.getPageById);
  const currentPage = useComponentStore((state) => state.currentPage);
  const currentPageIndex = useComponentStore((state) => state.currentPageIndex);
  const pagesLength = useComponentStore((state) => state.pages.length); // Get the global state
  const goToPage = useComponentStore((state) => state.goToPage); // Get the global state

  useEffect(() => {
    if (pagesLength == 0 && currentPage == '') {
      addPage();
    }
  }, []);

  const presetComponentTypes: Array<[ComponentType, string]> = [
    ['multi', 'Multi'],
    ['setfocus', 'Set Focus'],
    ['fade', 'Fade'],
    ['flyto', 'Fly To'],
    ['settime', 'Set Time'],
  ];

  const staticComponentTypes: Array<[ComponentType, string]> = [
    ['richtext', 'Rich Text'],
    ['title', 'Title'],
    ['video', 'Video'],
    ['image', 'Image'],
    ['timepanel', 'Time Panel'],
    ['navpanel', 'Nav Panel'],
  ];

  const propertyComponentTypes: Array<[ComponentType, string]> = [
    ['number', 'Number'],
    ['boolean', 'Boolean'],
    ['trigger', 'Trigger'],
  ];

  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    setIsModalOpen(true);
  };

  const handleImmediateAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    addComponent({
      id: newId,
      type: type,
      isMulti: 'false' as MultiState,
      gui_description: '',
      gui_name: '',
      x: 0,
      y: 0,
      minHeight: 150,
      minWidth: 150,
      width: 425,
      height: type == 'timepanel' ? 250 : 600,
    });
  };

  const handleEditComponent = (id: string) => {
    setCurrentComponentId(id);
    setIsModalOpen(true);
  };

  const handleDeleteComponent = (id: string) => {
    const componentToDelete = getComponentById(id);
    if (componentToDelete?.type == 'multi') {
      (componentToDelete as MultiComponent).components.forEach((c) => {
        console.log(c);
        updateComponent(c.component, { isMulti: 'false' });
      });
    }
    removeComponent(id);
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllModalOpen(true);
  };

  const handleDeleteAllConfirm = () => {
    removeAllComponents();
    setIsDeleteAllModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentComponentId(null);
  };

  const panelRef = useRef<ImperativePanelHandle>(null);

  const [sizes, setSizes] = useState<number[]>([20, 80]); // Initial sizes for two panels

  const handleResize = (panelIndex: number, newSize: number) => {
    setSizes((prevSizes) => {
      const updatedSizes = [...prevSizes];
      updatedSizes[panelIndex] = newSize;
      return updatedSizes;
    });
  };

  const triggerResize = () => {
    // Example to trigger resizing: Setting panel 1 to 30% and panel 2 to 70%
    setSizes([5, 95]);
  };

  const [collapsing, setCollapsing] = useState(false);
  const collapsePanel = (perc: number) => {
    const panel = panelRef.current;
    setCollapsing(true);
    if (panel) {
      panel.resize(perc);
      setTimeout(() => {
        setCollapsing(false);
      }, 300);
    }
  };
  return (
    <>
      <TooltipProvider delayDuration={250}>
        <ResizablePanelGroup
          direction="horizontal"
          className=" flex h-screen w-screen  overflow-hidden  rounded-[0.5rem] border bg-[#f8fafc]"
          onLayout={(newSizes: number[]) => setSizes(newSizes)}
        >
          <ResizablePanel
            collapsible
            ref={panelRef}
            // defaultSize={20}
            defaultSize={sizes[0]}
            onResize={(size) => handleResize(0, size)}
            collapsedSize={5}
            maxSize={25}
            // minSize={isPresentMode ? 0 : 5}
            // className="border"
            className={`${
              collapsing ? 'transition-all duration-300' : ''
            } border`}
          >
            <div className="flex h-screen flex-col">
              <div className=" flex-0 p-4">
                <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Youth Learner Interface
                </h2>
              </div>
              <Separator />
              {/* <PresentModeToggle />
              <SettingsMenu /> */}
              {/* {!isPresentMode && ( */}
              {/* <div className="h-full w-full p-4"> */}
              <div className="flex  flex-col gap-4 px-4 py-1">
                <div className="flex flex-wrap gap-2">
                  <ToggleGroup type="single">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem onClick={saveStore} value="a">
                          <Save size={20} />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white">
                        Save to your computer
                      </TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem onClick={loadStore} value="b">
                          <Folder size={20} />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white">
                        Load from your computer
                      </TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" />

                    <DeleteConfirmationModal
                      onConfirm={handleDeleteAllConfirm}
                      message="This action cannot be undone. This will permanently delete the
              components from the project."
                      triggerButton={
                        <ToggleGroupItem value="c">
                          <Trash2 size={20} />
                        </ToggleGroupItem>
                      }
                    />

                    <Separator orientation="vertical" />
                    <ConnectionSettings
                      triggerButton={
                        <ToggleGroupItem value="d">
                          <Settings size={20} />
                        </ToggleGroupItem>
                      }
                    />
                  </ToggleGroup>
                  <Separator />
                  <div className="py-2">
                    <ConnectionStatus />
                  </div>
                  {/* */}
                </div>
                {/* <ImageUpload /> */}
              </div>
              <Separator />
              <ScrollArea className="flex-0 ">
                <div className="grid gap-4 p-4">
                  <h2 className="text-xs font-bold ">Static Components</h2>
                  <div className="col-2 grid gap-4 sm:grid-cols-2">
                    {staticComponentTypes.map((type) => (
                      <Button
                        variant={'outline'}
                        key={type[0]}
                        size={'sm'}
                        className="flex flex-row items-center justify-between "
                        onClick={() =>
                          type[0] == 'timepanel' || type[0] == 'navpanel'
                            ? handleImmediateAddComponent(type[0])
                            : handleAddComponent(type[0])
                        }
                      >
                        {/* svg for PLUS sign */}

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 inline-block h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={4}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {type[1]}
                      </Button>
                    ))}
                  </div>
                  <h2 className="mt-4 text-xs font-bold text-black">
                    Preset Components
                  </h2>
                  <div className="col-2 grid gap-4 sm:grid-cols-2">
                    {presetComponentTypes.map((type) => (
                      <Button
                        key={type[0]}
                        size={'sm'}
                        variant={'secondary'}
                        className="flex flex-row items-center justify-between "
                        onClick={() =>
                          type[0] == 'timepanel' || type[0] == 'navpanel'
                            ? handleImmediateAddComponent(type[0])
                            : handleAddComponent(type[0])
                        }
                      >
                        {/* svg for PLUS sign */}

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 inline-block h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={4}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {type[1]}
                      </Button>
                    ))}
                  </div>
                  <h2 className="mt-4 text-xs font-bold text-black">
                    Property Components
                  </h2>
                  <div className="col-2 grid gap-4 sm:grid-cols-2">
                    {propertyComponentTypes.map((type) => (
                      <Button
                        key={type[0]}
                        size={'sm'}
                        variant={'default'}
                        className="flex flex-row items-center justify-between "
                        onClick={() =>
                          type[0] == 'timepanel' || type[0] == 'navpanel'
                            ? handleImmediateAddComponent(type[0])
                            : handleAddComponent(type[0])
                        }
                      >
                        {/* svg for PLUS sign */}

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 inline-block h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={4}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {type[1]}
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
              <Separator />

              {/* <div className="grid w-full gap-4 p-4">
             
            </div> */}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            // defaultSize={85}
            defaultSize={sizes[1]}
            onResize={(size) => handleResize(1, size)}
          >
            <div
              className={`right relative flex h-full flex-1 flex-col bg-gray-100 transition-all duration-300 `}
            >
              {/* {!isPresentMode && (
                <h2 className="scroll-m-20 p-4 text-xl font-semibold tracking-tight">
                  Workspace
                </h2>
              )} */}
              {/* <div className={`flex-1`}> */}
              <div className=" m-0 h-full w-full rounded border bg-white ">
                <DroppableWorkspace>
                  {getPageById(currentPage).components.map((component) => {
                    const c = components[component];
                    return (
                      <DraggableComponent
                        key={component}
                        component={c}
                        onEdit={() => handleEditComponent(component)}
                        onDelete={() => handleDeleteComponent(component)}
                      />
                    );
                  })}
                </DroppableWorkspace>
              </div>
              <Pagination
                currentIndex={currentPageIndex}
                length={pagesLength}
                setIndex={goToPage}
              />
              {/* </div> */}

              {!isPresentMode && (
                <button
                  className="fixed bottom-8 left-8 z-40 rounded-full bg-gray-800 p-4 text-white"
                  onClick={() => setIsBottombarOpen(!isBottombarOpen)}
                >
                  {/*  svg bottom/up arrow */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
              )}

              <BottomDrawer
                isOpen={isBottombarOpen}
                onClose={() => setIsBottombarOpen(false)}
              >
                <SubscriptionPanel />
              </BottomDrawer>
            </div>
            <ComponentModal
              isOpen={isModalOpen}
              onClose={handleModalClose}
              componentId={currentComponentId}
              type={currentComponentType}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </>
  );
};

export default App;
