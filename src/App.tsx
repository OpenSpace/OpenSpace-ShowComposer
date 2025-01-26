import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';

import ComponentModal from './components/ComponentModal';
import DraggableComponent from './components/DraggableComponent';
import DroppableWorkspace from './components/DroppableWorkspace';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';

import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
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

import {
  ComponentType,
  ConnectionState,
  useOpenSpaceApiStore,
  useSettingsStore,
} from './store';
import { loadStore, saveStore } from './utils/saveProject';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionStatus } from './components/ConnectionSettings';
import Pagination from './components/Pagination';
import DraggablePanel from './components/DraggablePanel';
import { MultiComponent } from './store/ComponentTypes';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import FeedbackPanel from './components/FeedbackPanel';
import PageButtonMenu from './components/PageButtonMenu';
import PresentModeToggle from './components/PresentModeToggle';
import { getCopy } from './utils/copyHelpers';
import { LayoutToolbar } from './components/layouts/LayoutToolbar';
import Toolbar from './components/Toolbar';
import { Position } from './store/positionSlice';
import { LayoutContainer } from './components/layouts/LayoutContainer';
import NewProjectModal from './components/NewProjectModal';
import { Label } from './components/ui/label';
import ImportShowModal from './components/ImportShowModal'; // Import the new modal
import LayoutEditModal from './components/layouts/LayoutEditModal';
import { useBoundStore } from './store/boundStore';
import Undo from './components/Undo';
import ToggleButton from './components/ToggleButton';
import GlobalMenuBar from './components/GlobalMenuBar';
// import TooltipHolder from './components/common/TooltipHolder';

type ComponentTypeData = {
  type: ComponentType;
  name: string;
  icon: JSX.Element;
};

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [_isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [currentComponentId, setCurrentComponentId] = useState<string | null>(
    null,
  );
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
  const [currentComponentType, setCurrentComponentType] = useState<
    ComponentType | ''
  >('');

  const components = useBoundStore((state) => {
    return state.components;
  });

  const getComponentById = useBoundStore((state) => state.getComponentById);
  const removeAllComponents = useBoundStore(
    (state) => state.removeAllComponents,
  );

  const removeComponent = useBoundStore((state) => state.removeComponent);
  const createStaticPanels = useBoundStore((state) => state.createPanels);
  const NavPanel = useBoundStore((state) => state.navpanel);
  const NavPosition = useBoundStore(
    (state) => state.positions[NavPanel?.id || ''],
  );
  const TimePanel = useBoundStore((state) => state.timepanel);
  const TimePosition = useBoundStore(
    (state) => state.positions[TimePanel?.id || ''],
  );
  const StatusPanel = useBoundStore((state) => state.statuspanel);
  const StatusPosition = useBoundStore(
    (state) => state.positions[StatusPanel?.id || ''],
  );
  const RecordPanel = useBoundStore((state) => state.recordpanel);
  const RecordPosition = useBoundStore(
    (state) => state.positions[RecordPanel?.id || ''],
  );

  const updateComponent = useBoundStore((state) => state.updateComponent);
  const copyComponent = useBoundStore((state) => state.copyComponent);
  const updatePosition = useBoundStore((state) => state.updatePosition);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const addPage = useBoundStore((state) => state.addPage);
  const layouts = useBoundStore((state) => state.layouts);
  const currentPage = useBoundStore((state) => state.currentPage);
  const currentPageIndex = useBoundStore((state) => state.currentPageIndex);
  const pagesLength = useBoundStore((state) => state.pages?.length); // Get the global state
  const goToPage = useBoundStore((state) => state.goToPage); // Get the global state
  const projectName = useSettingsStore((state) => state.projectName);

  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );

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
    {
      type: 'action',
      name: getCopy('Main', 'action'),
      icon: <CirclePlay className="h-5 w-5" />,
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
  const minimize = (position: Position | null) => {
    updatePosition(position?.id || '', {
      minimized: !position?.minimized,
    });
  };

  const handleEditComponent = (id: string) => {
    setCurrentComponentId(id);
    setIsModalOpen(true);
  };
  const handleEditLayout = (id: string) => {
    setCurrentLayoutId(id);
    setShowEditModal(true);
  };

  const handleCopyComponent = (id: string) => {
    copyComponent(id);
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
                <div className=" flex-0 felx flex flex-row items-center gap-2 p-2 px-3">
                  <img
                    src="/src/assets/images/favicon.png"
                    width={20}
                    className="p-0"
                  />
                  <h2 className=" scroll-m-20 text-xs font-bold tracking-tight">
                    {getCopy('Main', 'interface_name')}
                  </h2>
                </div>
                {/* <Separator /> */}
                {/* <div className="p-2">
                  <Toolbar
                    onSave={saveStore}
                    onLoad={handleLoadStore}
                    onDeleteAllConfirm={handleDeleteAllConfirm}
                  />
                </div> */}
                {/* <Separator /> */}

                {/* <div className="flex items-center"> */}

                {/* </div> */}

                <Separator />
                {/* <div className=" p-2">
                  <Undo />
                </div> */}

                <GlobalMenuBar />
                <Separator />

                {/* <div className="p-2">
                  <ConnectionStatus />
                </div> */}
                {/* </div> */}
                {/* <div className="flex flex-col gap-2 px-4 py-1">
                  <div className="flex flex-row items-center gap-3">
                    <Label>{getCopy('Main', 'current_show')}:</Label>
                    <div className="text-sm">{projectName}</div>
                  </div>
                  <div className="py-2">
                    <NewProjectModal />
                  </div>
                </div> */}
                {/* <Separator /> */}

                <div className="flex  flex-col gap-4 px-4 py-4 @container">
                  {/* <div className="flex flex-wrap items-center gap-2">
                    <div className="py-2"> */}
                  <ConnectionStatus />

                  {/* </div>
                  </div> */}
                  <Separator />
                  <Undo />
                  <Separator />
                  {/* <div className="flex flex-row items-center  gap-2"> */}

                  {/* </div> */}
                  {/* <Separator /> */}
                </div>

                <div className="grid gap-2 p-2 @[167px]:gap-4">
                  <h2 className="ml-2 text-xs font-bold ">
                    {getCopy('Main', 'layout')}
                  </h2>
                  <LayoutToolbar />
                  <Separator />
                </div>
                {/* <Separator /> */}
                <ScrollArea className="flex-0 @container" type="always">
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
                          onClick={() => handleAddComponent(v.type)}
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
                id="workspace"
              >
                <DroppableWorkspace>
                  {/* Static Panels */}
                  {NavPanel && <DraggablePanel component={NavPanel} />}
                  {TimePanel && <DraggablePanel component={TimePanel} />}
                  {StatusPanel && <DraggablePanel component={StatusPanel} />}
                  {RecordPanel && <DraggablePanel component={RecordPanel} />}
                  {Object.keys(layouts).map((layoutId) => {
                    const layout = layouts[layoutId];
                    if (
                      !layout ||
                      (layout.parentPage && layout.parentPage != currentPage)
                    ) {
                      return null;
                    }
                    return (
                      <LayoutContainer
                        key={layoutId}
                        layout={layout}
                        handleOpenEditModal={() => handleEditLayout(layoutId)}
                      >
                        {layout.children.map((childId) => {
                          if (!childId) return null;
                          const component = components[childId];
                          if (!component) return null;
                          return (
                            <DraggableComponent
                              key={childId}
                              component={component}
                              layoutId={layoutId}
                              onEdit={() => handleEditComponent(childId)}
                              onDelete={() => handleDeleteComponent(childId)}
                              onCopy={() => handleCopyComponent(childId)}
                            />
                          );
                        })}
                      </LayoutContainer>
                    );
                  })}

                  {Object.keys(components).map((componentId) => {
                    const component = components[componentId];
                    // console.log(
                    //   'component in workspace render loop ',
                    //   component,
                    // );
                    // Skip if component is in a layout
                    if (
                      !component ||
                      Object.values(layouts).some((layout) =>
                        layout.children.includes(componentId),
                      ) ||
                      (component.parentPage &&
                        component.parentPage != currentPage)
                    ) {
                      return null;
                    }
                    //skip it it belongs to a page that is not current page

                    return (
                      <DraggableComponent
                        key={componentId}
                        component={component}
                        onEdit={() => handleEditComponent(componentId)}
                        onDelete={() => handleDeleteComponent(componentId)}
                        onCopy={() => handleCopyComponent(componentId)}
                      />
                    );
                  })}
                </DroppableWorkspace>
              </div>
              <div className="absolute bottom-7 left-6 flex flex-row gap-2">
                <ToggleButton
                  tooltipText={getCopy('Main', 'navpanel')}
                  icon={navType.icon}
                  selected={NavPosition?.minimized}
                  onClick={() => minimize(NavPosition)}
                  disabled={connectionState != ConnectionState.CONNECTED}
                />
                <ToggleButton
                  tooltipText={getCopy('Main', 'timepanel')}
                  icon={timeType.icon}
                  selected={TimePosition?.minimized}
                  onClick={() => minimize(TimePosition)}
                  disabled={connectionState != ConnectionState.CONNECTED}
                />
                <ToggleButton
                  tooltipText={getCopy('Main', 'statuspanel')}
                  icon={statusType.icon}
                  selected={StatusPosition?.minimized}
                  onClick={() => minimize(StatusPosition)}
                  disabled={connectionState != ConnectionState.CONNECTED}
                />
                <ToggleButton
                  tooltipText={getCopy('Main', 'recordpanel')}
                  icon={recordType.icon}
                  selected={RecordPosition?.minimized}
                  onClick={() => minimize(RecordPosition)}
                  disabled={connectionState != ConnectionState.CONNECTED}
                />
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
            <LayoutEditModal
              isOpen={showEditModal}
              layoutId={currentLayoutId}
              onClose={() => setShowEditModal(false)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
