import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';

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
  View,
  BookOpenCheck,
} from 'lucide-react';

import { ComponentType, useComponentStore, useSettingsStore } from './store';
import { loadStore, saveStore } from './utils/saveProject';
import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionSettings,
  ConnectionStatus,
} from './components/ConnectionSettings';
import Pagination from './components/Pagination';
import DraggablePanel from './components/DraggablePanel';
import {
  MultiComponent,
  NavComponent,
  TimeComponent,
  StatusComponent,
  RecordComponent,
} from './store/componentsStore';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import FeedbackPanel from './components/FeedbackPanel';
import { DarkModeToggle } from './components/DarkModeToggle';
import PageButtonMenu from './components/PageButtonMenu';
import PresentModeToggle from './components/PresentModeToggle';
import TooltipHolder from './components/common/TooltipHolder';
import { getCopy } from './utils/copyHelpers';
import { LayoutContainer } from './components/layouts/LayoutContainer';

type ComponentTypeData = {
  type: ComponentType;
  name: string;
  icon: JSX.Element;
};

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const createStaticPanels = useComponentStore((state) => state.createPanels);
  const updatePanel = useComponentStore((state) => state.updatePanel);
  const NavPanel = useComponentStore((state) => state.navpanel);
  const TimePanel = useComponentStore((state) => state.timepanel);
  const StatusPanel = useComponentStore((state) => state.statuspanel);
  const RecordPanel = useComponentStore((state) => state.recordpanel);
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const addPage = useComponentStore((state) => state.addPage);
  const getPageById = useComponentStore((state) => state.getPageById);
  const layouts = useComponentStore((state) => state.layouts);

  const currentPage = useComponentStore((state) => state.currentPage);
  const currentPageIndex = useComponentStore((state) => state.currentPageIndex);
  const pagesLength = useComponentStore((state) => state.pages?.length); // Get the global state
  const goToPage = useComponentStore((state) => state.goToPage); // Get the global state

  useEffect(() => {
    if (pagesLength == 0 && currentPage == '') {
      addPage();
    }

    if (!NavPanel || !TimePanel || !StatusPanel || !RecordPanel)
      createStaticPanels();
  }, []);

  const presetComponentTypes: Array<ComponentTypeData> = [
    { type: 'multi', name: getCopy('Main', 'multi'), icon: <Group /> },
    {
      type: 'setfocus',
      name: getCopy('Main', 'setfocus'),
      icon: <Telescope />,
    },
    { type: 'fade', name: getCopy('Main', 'fade'), icon: <SunMoon /> },
    { type: 'flyto', name: getCopy('Main', 'flyto'), icon: <Plane /> },
    { type: 'settime', name: getCopy('Main', 'settime'), icon: <History /> },
    {
      type: 'setnavstate',
      name: getCopy('Main', 'setnav'),
      icon: <Compass />,
    },
    {
      type: 'sessionplayback',
      name: getCopy('Main', 'playback'),
      icon: <Video />,
    },
    { type: 'page', name: getCopy('Main', 'page'), icon: <BookOpenCheck /> },
  ];

  const propertyComponentTypes: Array<ComponentTypeData> = [
    { type: 'number', name: getCopy('Main', 'number'), icon: <Hash /> },
    {
      type: 'boolean',
      name: getCopy('Main', 'boolean'),
      icon: <ToggleRight />,
    },
    {
      type: 'trigger',
      name: getCopy('Main', 'trigger'),
      icon: <CirclePlay className="h-5 w-5" />,
    },
  ];

  const staticComponentTypes: Array<ComponentTypeData> = [
    {
      type: 'richtext',
      name: getCopy('Main', 'richtext'),
      icon: <AlignJustify />,
    },
    { type: 'title', name: getCopy('Main', 'title'), icon: <LetterText /> },
    { type: 'video', name: getCopy('Main', 'video'), icon: <Video /> },
    { type: 'image', name: getCopy('Main', 'image'), icon: <Image /> },
  ];

  const timeType = {
    type: 'timepanel',
    name: getCopy('Main', 'timepanel'),
    icon: <Clock className="h-5 w-5" />,
  };

  const navType = {
    type: 'navpanel',
    name: getCopy('Main', 'navpanel'),
    icon: <Compass className="h-5 w-5" />,
  };

  const statusType = {
    type: 'statuspanel',
    name: getCopy('Main', 'statuspanel'),
    icon: <View className="h-5 w-5" />,
  };

  const recordType = {
    type: 'recordpanel',
    name: getCopy('Main', 'recordpanel'),
    icon: <Video className="h-5 w-5" />,
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
  const minimize = (
    component:
      | TimeComponent
      | NavComponent
      | StatusComponent
      | RecordComponent
      | null,
  ) => {
    updatePanel({
      type: component?.type,
      minimized: component ? !component.minimized : false,
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

  const [_collapsing, setCollapsing] = useState(false);
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
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={250}>
        <ResizablePanelGroup
          direction="horizontal"
          className=" flex h-screen w-screen  overflow-hidden   border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          onLayout={(newSizes: number[]) => setSizes(newSizes)}
        >
          <ResizablePanel
            collapsible
            ref={panelRef}
            defaultSize={sizes[0]}
            onResize={(size) => handleResize(0, size)}
            collapsedSize={0}
            maxSize={35}
            className="h-screen max-w-[320px]"
          >
            <div className="h-full w-full  p-4 pr-2 ">
              <div className="flex h-full flex-col overflow-hidden rounded-lg border dark:border-slate-800">
                <div className=" flex-0 p-4">
                  <h2 className="scroll-m-20 text-xl tracking-tight">
                    {getCopy('Main', 'interface_name')}
                  </h2>
                </div>
                <Separator />
                <div className="flex  flex-col gap-4 px-4 py-1 @container">
                  <div className="flex flex-wrap gap-2 ">
                    <ToggleGroup type="single">
                      <TooltipHolder content="Save to your computer">
                        <ToggleGroupItem onClick={saveStore} value="a">
                          <Save size={20} />
                        </ToggleGroupItem>
                      </TooltipHolder>
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
                      <Separator orientation="vertical" />
                      <ToggleGroupItem value="lightdark">
                        <DarkModeToggle />
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <Separator />
                    <div className="py-2">
                      <ConnectionStatus />
                    </div>
                  </div>
                </div>
                <Separator />
                <ScrollArea className="flex-0 @container">
                  <div className="grid gap-2 p-4 @[167px]:gap-4">
                    <h2 className="text-xs font-bold ">
                      {getCopy('Main', 'static_components')}
                    </h2>
                    <div className="col-2 grid grid-cols-2 gap-2 @[167px]:gap-4">
                      {staticComponentTypes.map((v, _i) => (
                        <Button
                          key={v.type}
                          size={'sm'}
                          variant={'outline'}
                          className="flex flex-row items-center justify-between @container"
                          onClick={() => handleAddComponent(v.type)}
                        >
                          {v.icon}
                          <span className="hidden @[40px]:inline">
                            {v.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <h2 className="mt-4 text-xs font-bold">
                      {getCopy('Main', 'preset_components')}
                    </h2>
                    <div className="col-2 grid grid-cols-2 gap-2 @[167px]:gap-4">
                      {presetComponentTypes.map((v, _i) => (
                        <Button
                          key={v.type}
                          size={'sm'}
                          variant={'secondary'}
                          className="flex flex-row items-center justify-between @container"
                          onClick={() => handleAddComponent(v.type)}
                        >
                          {v.icon}
                          <span className="hidden @[40px]:inline">
                            {v.name}
                          </span>
                        </Button>
                      ))}
                    </div>
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
                          <span className="hidden @[40px]:inline">
                            {v.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                <Separator />
                <FeedbackPanel className="p-4" />
              </div>
            </div>
          </ResizablePanel>
          {!isPresentMode && <ResizableHandle withHandle />}

          <ResizablePanel
            defaultSize={sizes[1]}
            onResize={(size) => handleResize(1, size)}
          >
            <div
              className={`right relative flex h-full flex-1 flex-col transition-all duration-300 `}
            >
              <div
                className={`dark:text-slate-5 m-0 h-full  w-full border-slate-200 bg-white ${
                  isPresentMode ? 'p-0' : 't p-4 pl-2'
                } ext-slate-950 dark:border-slate-800 dark:bg-slate-950 `}
              >
                <DroppableWorkspace>
                  {/* Static Panels */}
                  {NavPanel && <DraggablePanel component={NavPanel} />}
                  {TimePanel && <DraggablePanel component={TimePanel} />}
                  {StatusPanel && <DraggablePanel component={StatusPanel} />}
                  {RecordPanel && <DraggablePanel component={RecordPanel} />}

                  {/* Layouts */}
                  {Object.entries(layouts).map(([layoutId, layout]) => {
                    // console.log('Rendering layout:', layoutId, layout);
                    return (
                      <LayoutContainer key={layoutId} layout={layout}>
                        {layout.children.map((childId) => {
                          const component = components[childId];
                          if (!component) return null;
                          return (
                            <DraggableComponent
                              key={childId}
                              component={component}
                              layoutId={layoutId}
                              onEdit={() => handleEditComponent(childId)}
                              onDelete={() => handleDeleteComponent(childId)}
                            />
                          );
                        })}
                      </LayoutContainer>
                    );
                  })}

                  {/* Regular Components - only render if not in a layout */}
                  {getPageById(currentPage).components.map((componentId) => {
                    const component = components[componentId];
                    // Skip if component is in a layout
                    if (
                      !component ||
                      Object.values(layouts).some((layout) =>
                        layout.children.includes(componentId),
                      )
                    ) {
                      return null;
                    }
                    return (
                      <DraggableComponent
                        key={componentId}
                        component={component}
                        onEdit={() => handleEditComponent(componentId)}
                        onDelete={() => handleDeleteComponent(componentId)}
                      />
                    );
                  })}
                </DroppableWorkspace>
              </div>
              <div className="absolute bottom-7 left-6 flex flex-row gap-2">
                <Tooltip>
                  <TooltipContent>
                    Toggle {getCopy('Main', 'navpanel')}
                  </TooltipContent>
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
                  <TooltipContent>
                    Toggle {getCopy('Main', 'timepanel')}
                  </TooltipContent>
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
                <Tooltip>
                  <TooltipContent>
                    {' '}
                    Toggle {getCopy('Main', 'statuspanel')}
                  </TooltipContent>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={'outline'}
                      onClick={() => minimize(StatusPanel)}
                      className={`z-40 ${
                        !StatusPanel?.minimized ? 'opacity-60' : 'opacity-100'
                      }`}
                    >
                      {statusType.icon}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
                <Tooltip>
                  <TooltipContent>
                    Toggle {getCopy('Main', 'recordpanel')}
                  </TooltipContent>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={'outline'}
                      onClick={() => minimize(RecordPanel)}
                      className={`z-40 ${
                        !RecordPanel?.minimized ? 'opacity-60' : 'opacity-100'
                      }`}
                    >
                      {recordType.icon}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </div>

              <Pagination
                currentIndex={currentPageIndex}
                length={pagesLength}
                setIndex={goToPage}
              />
              <div className="absolute bottom-7 right-6 flex flex-row gap-2">
                <PageButtonMenu />
                <PresentModeToggle />
              </div>
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
    </ThemeProvider>
  );
};

export default App;
