import { useEffect, useRef, useState } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import {
  AlignJustify,
  BookOpenCheck,
  CirclePlay,
  Clock,
  Code,
  Compass,
  Group,
  Hash,
  History,
  Image,
  LetterText,
  MessageSquareWarning,
  Plane,
  SunMoon,
  Telescope,
  ToggleRight,
  Video,
  View
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import favicon from './assets/images/favicon.png';
import ComponentModal from './components/ComponentModal';
import { ConnectionStatus } from './components/ConnectionSettings';
import DraggableComponent from './components/DraggableComponent';
import DraggablePanel from './components/DraggablePanel';
import DroppableWorkspace from './components/DroppableWorkspace';
import FeedbackPanel from './components/FeedbackPanel';
import GlobalMenuBar from './components/GlobalMenuBar';
import { LayoutContainer } from './components/layouts/LayoutContainer';
import LayoutEditModal from './components/layouts/LayoutEditModal';
import { LayoutToolbar } from './components/layouts/LayoutToolbar';
import Pagination from './components/Pagination';
// import PageButtonMenu from './components/PageButtonMenu';
import PresentModeToggle from './components/PresentModeToggle';
import { ThemeProvider } from './components/ThemeProvider';
import ToggleButton from './components/ToggleButton';
import Undo from './components/Undo';
import { useBoundStore } from './store/boundStore';
import { Position } from './store/positionSlice';
import { MultiComponent } from './types/components';
import { getCopy } from './utils/copyHelpers';
import {
  ComponentType,
  ConnectionState,
  useOpenSpaceApiStore,
  useSettingsStore
} from './store';
// import { useNavigate } from 'react-router-dom';
// import TooltipHolder from './components/common/TooltipHolder';

type ComponentTypeData = {
  type: ComponentType;
  name: string;
  icon: JSX.Element;
};

const Editor = () => {
  // const currentPath = window.location.pathname;
  // const navigate = useNavigate();
  // let basePath = currentPath;
  // if (currentPath.split('/').pop() === 'hub') {
  //   basePath = currentPath.split('/').slice(0, -1).join('/');
  // }
  // useEffect(() => {
  //   // Check if the user navigated directly to /hub
  //   // const currentPath = window.location.pathname;
  //   if (currentPath.split('/').pop() === 'hub') {
  //     navigate(`${basePath}/hub`); // Redirect to the correct base path
  //   }
  // }, [navigate]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [currentComponentId, setCurrentComponentId] = useState<string | null>(null);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
  const [currentComponentType, setCurrentComponentType] = useState<ComponentType | ''>(
    ''
  );

  const components = useBoundStore((state) => {
    return state.components;
  });

  const getComponentById = useBoundStore((state) => state.getComponentById);

  const removeComponent = useBoundStore((state) => state.removeComponent);
  const createStaticPanels = useBoundStore((state) => state.createPanels);
  const NavPanel = useBoundStore((state) => state.navpanel);
  const NavPosition = useBoundStore((state) => state.positions[NavPanel?.id || '']);
  const TimePanel = useBoundStore((state) => state.timepanel);
  const TimePosition = useBoundStore((state) => state.positions[TimePanel?.id || '']);
  const StatusPanel = useBoundStore((state) => state.statuspanel);
  const StatusPosition = useBoundStore((state) => state.positions[StatusPanel?.id || '']);
  const RecordPanel = useBoundStore((state) => state.recordpanel);
  const RecordPosition = useBoundStore((state) => state.positions[RecordPanel?.id || '']);
  const LogPanel = useBoundStore((state) => state.logpanel);
  const LogPosition = useBoundStore((state) => state.positions[LogPanel?.id || '']);

  const updateComponent = useBoundStore((state) => state.updateComponent);
  const copyComponent = useBoundStore((state) => state.copyComponent);
  const updatePosition = useBoundStore((state) => state.updatePosition);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const showPagination = useSettingsStore((state) => state.showPagination);
  const addPage = useBoundStore((state) => state.addPage);
  const layouts = useBoundStore((state) => state.layouts);
  const currentPage = useBoundStore((state) => state.currentPage);
  const currentPageIndex = useBoundStore((state) => state.currentPageIndex);
  const pagesLength = useBoundStore((state) => state.pages?.length); // Get the global state
  const goToPage = useBoundStore((state) => state.goToPage); // Get the global state
  const projectName = useSettingsStore((state) => state.projectName);

  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const connect = useOpenSpaceApiStore((state) => state.connect);

  useEffect(() => {
    if (pagesLength == 0 && currentPage == '') {
      addPage();
    }
    connect();
  }, []);

  useEffect(() => {
    if (
      !NavPanel ||
      !TimePanel ||
      !StatusPanel ||
      !RecordPanel ||
      !LogPanel ||
      !NavPosition ||
      !TimePosition ||
      !StatusPosition ||
      !RecordPosition ||
      !LogPosition
    )
      createStaticPanels();
  }, [components]);

  const presetComponentTypes: Array<ComponentTypeData> = [
    { type: 'multi', name: getCopy('Main', 'multi'), icon: <Group /> },
    {
      type: 'setfocus',
      name: getCopy('Main', 'setfocus'),
      icon: <Telescope />
    },
    { type: 'fade', name: getCopy('Main', 'fade'), icon: <SunMoon /> },
    { type: 'flyto', name: getCopy('Main', 'flyto'), icon: <Plane /> },
    { type: 'settime', name: getCopy('Main', 'settime'), icon: <History /> },
    {
      type: 'setnavstate',
      name: getCopy('Main', 'setnav'),
      icon: <Compass />
    },
    {
      type: 'sessionplayback',
      name: getCopy('Main', 'playback'),
      icon: <Video />
    },
    {
      type: 'action',
      name: getCopy('Main', 'action'),
      icon: <CirclePlay className={'h-5 w-5'} />
    },
    { type: 'page', name: getCopy('Main', 'page'), icon: <BookOpenCheck /> },
    { type: 'script', name: getCopy('Main', 'script'), icon: <Code /> }
  ];

  const propertyComponentTypes: Array<ComponentTypeData> = [
    { type: 'number', name: getCopy('Main', 'number'), icon: <Hash /> },
    {
      type: 'boolean',
      name: getCopy('Main', 'boolean'),
      icon: <ToggleRight />
    },
    {
      type: 'trigger',
      name: getCopy('Main', 'trigger'),
      icon: <CirclePlay className={'h-5 w-5'} />
    }
  ];

  const staticComponentTypes: Array<ComponentTypeData> = [
    {
      type: 'richtext',
      name: getCopy('Main', 'richtext'),
      icon: <AlignJustify />
    },
    { type: 'title', name: getCopy('Main', 'title'), icon: <LetterText /> },
    { type: 'video', name: getCopy('Main', 'video'), icon: <Video /> },
    { type: 'image', name: getCopy('Main', 'image'), icon: <Image /> }
  ];

  const timeType = {
    type: 'timepanel',
    name: getCopy('Main', 'timepanel'),
    icon: <Clock className={'h-5 w-5'} />
  };

  const navType = {
    type: 'navpanel',
    name: getCopy('Main', 'navpanel'),
    icon: <Compass className={'h-5 w-5'} />
  };

  const statusType = {
    type: 'statuspanel',
    name: getCopy('Main', 'statuspanel'),
    icon: <View className={'h-5 w-5'} />
  };

  const recordType = {
    type: 'recordpanel',
    name: getCopy('Main', 'recordpanel'),
    icon: <Video className={'h-5 w-5'} />
  };

  const logType = {
    type: 'logpanel',
    name: getCopy('Main', 'logpanel'),
    icon: <MessageSquareWarning className={'h-5 w-5'} />
  };

  const allComponentTypes = [
    ...presetComponentTypes,
    ...propertyComponentTypes,
    ...staticComponentTypes
  ];

  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    setIsModalOpen(true);
  };
  const minimize = (position: Position | null) => {
    updatePosition(position?.id || '', {
      minimized: !position?.minimized
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
    <ThemeProvider defaultTheme={'dark'} storageKey={'vite-ui-theme'}>
      <TooltipProvider delayDuration={250}>
        <ResizablePanelGroup
          direction={'horizontal'}
          className={
            ' flex h-screen w-screen  overflow-hidden   border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50'
          }
          onLayout={(newSizes: number[]) => setSizes(newSizes)}
        >
          <ResizablePanel
            collapsible
            ref={panelRef}
            defaultSize={sizes[0]}
            onResize={(size) => handleResize(0, size)}
            collapsedSize={0}
            maxSize={35}
            className={'h-screen max-w-[320px]'}
          >
            <div className={'h-full w-full  p-4 pr-2 '}>
              <div
                className={
                  'flex h-full flex-col overflow-hidden rounded-lg border dark:border-slate-800'
                }
              >
                <div className={' flex-0 felx flex flex-row items-center gap-2 p-2 px-3'}>
                  <img src={favicon} width={20} className={'p-0'} />
                  <h2 className={' scroll-m-20 text-xs font-bold tracking-tight'}>
                    {getCopy('Main', 'interface_name')}
                  </h2>
                </div>
                <Separator />
                <GlobalMenuBar />
                <Separator />
                {/* <div className="flex flex-row items-center gap-2 p-2 px-4">
                  <div className="text-xs font-bold ">
                    {getCopy('Main', 'project_name')}
                  </div>
                  <div className="text-sm font-normal">{projectName}</div>
                </div>
                <Separator /> */}
                <div className={'flex  flex-col gap-2 px-4 py-2 @container'}>
                  <ConnectionStatus />
                  <div className={'flex flex-row items-center gap-2  '}>
                    <div className={'text-xs font-bold '}>
                      {getCopy('Main', 'project_name')}
                    </div>
                    <div
                      className={'text-sm font-normal text-gray-500 dark:text-gray-400'}
                    >
                      {projectName}
                    </div>
                  </div>
                  <Separator />
                  <Undo />
                  <Separator />
                </div>

                <div className={'grid gap-2 p-2 @[167px]:gap-2'}>
                  <h2 className={'ml-2 text-xs font-bold '}>
                    {getCopy('Main', 'layout')}
                  </h2>
                  <LayoutToolbar />
                  <Separator />
                </div>
                <ScrollArea className={'flex-0 @container'} type={'always'}>
                  <div className={'grid gap-2 p-4 @[167px]:gap-4'}>
                    <h2 className={'text-xs font-bold '}>
                      {getCopy('Main', 'static_components')}
                    </h2>
                    <div className={'col-2 grid grid-cols-2 gap-2 @[167px]:gap-4'}>
                      {staticComponentTypes.map((v, _i) => (
                        <Button
                          key={v.type}
                          size={'sm'}
                          variant={'outline'}
                          className={
                            'flex flex-row items-center justify-between @container'
                          }
                          onClick={() => handleAddComponent(v.type)}
                        >
                          {v.icon}
                          <span className={'hidden @[40px]:inline'}>{v.name}</span>
                        </Button>
                      ))}
                    </div>
                    <h2 className={' text-xs font-bold'}>
                      {getCopy('Main', 'preset_components')}
                    </h2>
                    <div className={'col-2 grid grid-cols-2 gap-2 @[167px]:gap-4'}>
                      {presetComponentTypes.map((v, _i) => (
                        <Button
                          key={v.type}
                          size={'sm'}
                          variant={'secondary'}
                          className={
                            'flex flex-row items-center justify-between @container'
                          }
                          onClick={() => handleAddComponent(v.type)}
                        >
                          {v.icon}
                          <span className={'hidden @[40px]:inline'}>{v.name}</span>
                        </Button>
                      ))}
                    </div>
                    <div className={'col-2 grid grid-cols-2 gap-2 @[167px]:gap-4'}>
                      {propertyComponentTypes.map((v, _i) => (
                        <Button
                          key={v.type}
                          size={'sm'}
                          variant={'default'}
                          className={
                            'flex  flex-row items-center justify-between @container'
                          }
                          onClick={() => handleAddComponent(v.type)}
                        >
                          {v.icon}
                          <span className={'hidden @[40px]:inline'}>{v.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                <Separator />
                <FeedbackPanel className={'p-4'} />
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
                id={'workspace'}
              >
                <DroppableWorkspace>
                  {/* Static Panels */}
                  {NavPanel && <DraggablePanel component={NavPanel} />}
                  {TimePanel && <DraggablePanel component={TimePanel} />}
                  {StatusPanel && <DraggablePanel component={StatusPanel} />}
                  {RecordPanel && <DraggablePanel component={RecordPanel} />}
                  {LogPanel && <DraggablePanel component={LogPanel} />}
                  {Object.keys(layouts).map((layoutId) => {
                    const layout = layouts[layoutId];
                    if (
                      !layout ||
                      (!layout.persistent &&
                        layout.parentPage &&
                        layout.parentPage != currentPage)
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
                    // Skip if component is in a layout
                    if (
                      !component ||
                      Object.values(layouts).some((layout) =>
                        layout.children.includes(componentId)
                      ) ||
                      (component.parentPage && component.parentPage != currentPage)
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
              <div className={'absolute bottom-7 left-6 flex flex-row gap-2'}>
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
                <ToggleButton
                  tooltipText={getCopy('Main', 'logpanel')}
                  icon={logType.icon}
                  selected={LogPosition?.minimized}
                  onClick={() => minimize(LogPosition)}
                  disabled={connectionState != ConnectionState.CONNECTED}
                />
              </div>
              {(!isPresentMode || (showPagination && isPresentMode)) && (
                <Pagination
                  currentIndex={currentPageIndex}
                  length={pagesLength}
                  setIndex={goToPage}
                />
              )}
              <div className={'absolute bottom-7 right-6 flex flex-row gap-2'}>
                {/* <PageButtonMenu /> */}
                <PresentModeToggle />
              </div>
            </div>
            <ComponentModal
              isOpen={isModalOpen}
              onClose={handleModalClose}
              componentId={currentComponentId}
              type={currentComponentType}
              icon={allComponentTypes.find((v) => v.type == currentComponentType)?.icon}
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

export default Editor;
