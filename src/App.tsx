import { useEffect, useRef, useState } from 'react';
import ComponentModal from './components/ComponentModal';
import DraggableComponent from './components/DraggableComponent';
import DroppableWorkspace from './components/DroppableWorkspace';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Save,
  Folder,
  Trash2,
  Settings,
  Group,
  Telescope,
  SunMoon,
  Plane,
  History,
  LetterText,
  AlignJustify,
  Video,
  Image,
  Clock,
  Compass,
  ToggleRight,
  CirclePlay,
  Hash,
} from 'lucide-react';

import {
  ComponentType,
  loadStore,
  saveStore,
  useComponentStore,
  useSettingsStore,
} from './store';

import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionSettings,
  ConnectionStatus,
} from './components/ConnectionSettings';
import SubscriptionPanel from './components/SubscriptionPanel';
import BottomDrawer from './components/common/BottomDrawer';
import Pagination from './components/Pagination';
import DraggablePanel from './components/DraggablePanel';
import {
  MultiComponent,
  NavComponent,
  TimeComponent,
} from './store/componentsStore';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import FeedbackPanel from './components/FeedbackPanel';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBottombarOpen, setIsBottombarOpen] = useState(false);
  const [_isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
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
  // const addComponent = useComponentStore((state) => state.addComponent);
  const createPanels = useComponentStore((state) => state.createPanels);
  const updatePanel = useComponentStore((state) => state.updatePanel);
  const NavPanel = useComponentStore((state) => state.navpanel);
  const TimePanel = useComponentStore((state) => state.timepanel);
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

    if (!NavPanel || !TimePanel) createPanels();
  }, []);

  type ComponentTypeData = {
    type: ComponentType;
    name: string;
    icon: JSX.Element;
  };

  const presetComponentTypes: Array<ComponentTypeData> = [
    { type: 'multi', name: 'Multi', icon: <Group /> },
    { type: 'setfocus', name: 'Set Focus', icon: <Telescope /> },
    { type: 'fade', name: 'Fade', icon: <SunMoon /> },
    { type: 'flyto', name: 'Fly To', icon: <Plane /> },
    { type: 'settime', name: 'Set Time', icon: <History /> },
  ];

  const propertyComponentTypes: Array<ComponentTypeData> = [
    { type: 'number', name: 'Number', icon: <Hash /> },
    { type: 'boolean', name: 'Boolean', icon: <ToggleRight /> },
    {
      type: 'trigger',
      name: 'Trigger',
      icon: <CirclePlay className="h-5 w-5" />,
    },
  ];

  const staticComponentTypes: Array<ComponentTypeData> = [
    { type: 'richtext', name: 'Rich Text', icon: <AlignJustify /> },
    { type: 'title', name: 'Title', icon: <LetterText /> },
    { type: 'video', name: 'Video', icon: <Video /> },
    { type: 'image', name: 'Image', icon: <Image /> },
  ];
  const timeType = {
    type: 'timepanel',
    name: 'Time Panel',
    icon: <Clock className="h-5 w-5" />,
  };

  const navType = {
    type: 'navpanel',
    name: 'Nav Panel',
    icon: <Compass className="h-5 w-5" />,
  };

  const allComponentTypes = [
    ...presetComponentTypes,
    ...propertyComponentTypes,
    ...staticComponentTypes,
  ];

  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    setIsModalOpen(true);
  };
  const minimize = (component: TimeComponent | NavComponent | null) => {
    updatePanel({
      type: component?.type,
      minimized: component ? !component.minimized : false,
    });
  };

  // const handleImmediateAddComponent = (type: ComponentType) => {
  //   const newId = uuidv4();
  //   // addComponent({
  //   //   id: newId,
  //   //   type: type,
  //   //   isMulti: 'false' as MultiState,
  //   //   gui_description: '',
  //   //   gui_name: '',
  //   //   x: 0,
  //   //   y: 0,
  //   //   minHeight: 150,
  //   //   minWidth: 150,
  //   //   width: type == 'timepanel' ? 300 : 275,
  //   //   height: type == 'timepanel' ? 425 : 330,
  //   // });
  // };

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

  const handleDeleteAllConfirm = () => {
    removeAllComponents();
    setIsDeleteAllModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentComponentId(null);
  };

  const panelRef = useRef<ImperativePanelHandle>(null);

  const [sizes, setSizes] = useState<number[]>([25, 75]); // Initial sizes for two panels

  const handleResize = (panelIndex: number, newSize: number) => {
    setSizes((prevSizes) => {
      const updatedSizes = [...prevSizes];
      updatedSizes[panelIndex] = newSize;
      return updatedSizes;
    });
  };

  // const triggerResize = () => {
  //   // Example to trigger resizing: Setting panel 1 to 30% and panel 2 to 70%
  //   setSizes([5, 95]);
  // };

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

  useEffect(() => {
    if (isPresentMode) {
      collapsePanel(0);
    } else {
      collapsePanel(25);
    }
  }, [isPresentMode]);
  return (
    <TooltipProvider delayDuration={250}>
      <ResizablePanelGroup
        direction="horizontal"
        className=" flex h-screen w-screen  overflow-hidden   bg-slate-100/40"
        onLayout={(newSizes: number[]) => setSizes(newSizes)}
      >
        <ResizablePanel
          collapsible
          ref={panelRef}
          defaultSize={sizes[0]}
          onResize={(size) => handleResize(0, size)}
          collapsedSize={0}
          // minSize={}
          maxSize={25}
          className={`${
            collapsing ? 'transition-all duration-300' : ''
          } h-screen max-w-[320px] `}
        >
          <div className="h-full w-full  p-4 pr-2 ">
            <div className="flex h-full flex-col overflow-hidden rounded-lg border ">
              <div className=" flex-0 p-4">
                <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Youth Learner Interface
                </h2>
              </div>
              <Separator />
              <div className="flex  flex-col gap-4 px-4 py-1 @container">
                <div className="flex flex-wrap gap-2 ">
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
              <ScrollArea className="flex-0 @container">
                <div className="grid gap-2 p-4 @[167px]:gap-4">
                  <h2 className="text-xs font-bold ">Static Components</h2>
                  <div className="col-2 grid grid-cols-2 gap-2 @[167px]:gap-4">
                    {staticComponentTypes.map((v, _i) => (
                      <Button
                        key={v.type}
                        size={'sm'}
                        variant={'outline'}
                        className="flex flex-row items-center justify-between @container"
                        onClick={() =>
                          // v.type == 'timepanel' || v.type == 'navpanel'
                          //   ? handleImmediateAddComponent(v.type)
                          //   :
                          handleAddComponent(v.type)
                        }
                      >
                        {v.icon}
                        <span className="hidden @[40px]:inline">{v.name}</span>
                      </Button>
                    ))}
                  </div>
                  <h2 className="mt-4 text-xs font-bold text-black">
                    Preset Components
                  </h2>
                  <div className="col-2 grid grid-cols-2 gap-2 @[167px]:gap-4">
                    {presetComponentTypes.map((v, _i) => (
                      <Button
                        key={v.type}
                        size={'sm'}
                        variant={'secondary'}
                        className="flex flex-row items-center justify-between @container"
                        onClick={() =>
                          // v.type == 'timepanel' || v.type == 'navpanel'
                          //   ? handleImmediateAddComponent(v.type)
                          //   :
                          handleAddComponent(v.type)
                        }
                      >
                        {v.icon}
                        <span className="hidden @[40px]:inline">{v.name}</span>
                      </Button>
                    ))}
                  </div>
                  <h2 className="mt-4 text-xs font-bold text-black">
                    Property Components
                  </h2>
                  <div className="col-2 grid grid-cols-2 gap-2 @[167px]:gap-4">
                    {propertyComponentTypes.map((v, _i) => (
                      <Button
                        key={v.type}
                        size={'sm'}
                        variant={'default'}
                        className="flex  flex-row items-center justify-between @container"
                        onClick={() =>
                          // v.type == 'timepanel' || v.type == 'navpanel'
                          // ? handleImmediateAddComponent(v.type)
                          // :
                          handleAddComponent(v.type)
                        }
                      >
                        {v.icon}
                        <span className="hidden @[40px]:inline">{v.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
              <Separator />
              <FeedbackPanel />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel
          // defaultSize={85}
          defaultSize={sizes[1]}
          onResize={(size) => handleResize(1, size)}
        >
          <div
            className={`right relative flex h-full flex-1 flex-col transition-all duration-300 `}
          >
            {/* {!isPresentMode && (
                <h2 className="scroll-m-20 p-4 text-xl font-semibold tracking-tight">
                  Workspace
                </h2>
              )} */}
            {/* <div className={`flex-1`}> */}
            <div className=" m-0 h-full w-full bg-slate-100/40 p-4 pl-2 ">
              <DroppableWorkspace>
                {NavPanel && <DraggablePanel component={NavPanel} />}
                {TimePanel && <DraggablePanel component={TimePanel} />}
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
            <div className="absolute bottom-7 left-6 flex flex-row gap-2">
              <Tooltip>
                <TooltipContent>Toggle Nav Panel</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={'outline'}
                    onClick={() => minimize(NavPanel)}
                    className={`z-40 ${
                      !NavPanel?.minimized ? 'opacity-60' : 'opacity-100'
                    }`}
                  >
                    {navType.icon}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
              <Tooltip>
                <TooltipContent>Toggle Time Panel</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={'outline'}
                    className={`z-40 ${
                      !TimePanel?.minimized ? 'opacity-60' : 'opacity-100'
                    }`}
                    // pressed={!TimePanel?.minimized || false}
                    onClick={() => minimize(TimePanel)}
                  >
                    {timeType.icon}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
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
            icon={
              allComponentTypes.find((v) => v.type == currentComponentType)
                ?.icon
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default App;
