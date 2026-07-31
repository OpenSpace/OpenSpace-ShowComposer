import { useEffect, useRef, useState } from 'react';
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import {
  Box,
  Button,
  Divider,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text
} from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';

import favicon from '@/assets/images/favicon.png';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { Feedback } from '@/components/Feedback';
import Pagination from '@/components/Pagination';
import ToggleButton from '@/components/ToggleButton';
import DraggableComponent from '@/editor/canvas/DraggableComponent';
import DraggablePanel from '@/editor/canvas/DraggablePanel';
import DroppableWorkspace from '@/editor/canvas/DroppableWorkspace';
import { LayoutContainer } from '@/editor/canvas/LayoutContainer';
import PresentModeToggle from '@/editor/canvas/PresentModeToggle';
import GlobalMenuBar from '@/editor/menubar/GlobalMenuBar';
import LayoutEditModal from '@/editor/sidebar/LayoutEditModal';
import { LayoutToolbar } from '@/editor/sidebar/LayoutToolbar';
import ComponentModal from '@/editor/sidebar/modals/ComponentModal';
import Undo from '@/editor/sidebar/Undo';
import { useConnectionStatus } from '@/hooks/util';
import {
  AlignJustifyIcon,
  BookOpenCheckIcon,
  CirclePlayIcon,
  ClockIcon,
  CodeIcon,
  CompassIcon,
  GripVerticalIcon,
  GroupIcon,
  HashIcon,
  HistoryIcon,
  ImageIcon,
  LetterTextIcon,
  MessageSquareWarningIcon,
  PlaneIcon,
  SunMoonIcon,
  TelescopeIcon,
  ToggleRightIcon,
  VideoIcon,
  ViewIcon
} from '@/icons/icons';
import { ComponentType, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { Position } from '@/store/positionSlice';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { MultiComponent } from '@/types/components';
import { ConnectionStatus } from '@/types/enums';
import { getCopy } from '@/utils/copyHelpers';

import classes from './Editor.module.css';

type ComponentTypeData = {
  type: ComponentType;
  name: string;
  icon: JSX.Element;
};

function Editor() {
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

  const connectionStatus = useConnectionStatus();

  useEffect(() => {
    if (pagesLength == 0 && currentPage == '') {
      addPage();
    }
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
    { type: 'multi', name: getCopy('Main', 'multi'), icon: <GroupIcon size={20} /> },
    {
      type: 'setfocus',
      name: getCopy('Main', 'setfocus'),
      icon: <TelescopeIcon size={20} />
    },
    { type: 'fade', name: getCopy('Main', 'fade'), icon: <SunMoonIcon size={20} /> },
    { type: 'flyto', name: getCopy('Main', 'flyto'), icon: <PlaneIcon size={20} /> },
    {
      type: 'settime',
      name: getCopy('Main', 'settime'),
      icon: <HistoryIcon size={20} />
    },
    {
      type: 'setnavstate',
      name: getCopy('Main', 'setnav'),
      icon: <CompassIcon size={20} />
    },
    {
      type: 'sessionplayback',
      name: getCopy('Main', 'playback'),
      icon: <VideoIcon size={20} />
    },
    {
      type: 'action',
      name: getCopy('Main', 'action'),
      icon: <CirclePlayIcon size={20} />
    },
    {
      type: 'page',
      name: getCopy('Main', 'page'),
      icon: <BookOpenCheckIcon size={20} />
    },
    { type: 'script', name: getCopy('Main', 'script'), icon: <CodeIcon size={20} /> }
  ];

  const propertyComponentTypes: Array<ComponentTypeData> = [
    { type: 'number', name: getCopy('Main', 'number'), icon: <HashIcon size={20} /> },
    {
      type: 'boolean',
      name: getCopy('Main', 'boolean'),
      icon: <ToggleRightIcon size={20} />
    },
    {
      type: 'trigger',
      name: getCopy('Main', 'trigger'),
      icon: <CirclePlayIcon size={20} />
    }
  ];

  const staticComponentTypes: Array<ComponentTypeData> = [
    {
      type: 'richtext',
      name: getCopy('Main', 'richtext'),
      icon: <AlignJustifyIcon size={20} />
    },
    { type: 'title', name: getCopy('Main', 'title'), icon: <LetterTextIcon size={20} /> },
    { type: 'video', name: getCopy('Main', 'video'), icon: <VideoIcon size={20} /> },
    { type: 'image', name: getCopy('Main', 'image'), icon: <ImageIcon size={20} /> }
  ];

  const timeType = {
    type: 'timepanel',
    name: getCopy('Main', 'timepanel'),
    icon: <ClockIcon size={20} />
  };

  const navType = {
    type: 'navpanel',
    name: getCopy('Main', 'navpanel'),
    icon: <CompassIcon size={20} />
  };

  const statusType = {
    type: 'statuspanel',
    name: getCopy('Main', 'statuspanel'),
    icon: <ViewIcon size={20} />
  };

  const recordType = {
    type: 'recordpanel',
    name: getCopy('Main', 'recordpanel'),
    icon: <VideoIcon size={20} />
  };

  const logType = {
    type: 'logpanel',
    name: getCopy('Main', 'logpanel'),
    icon: <MessageSquareWarningIcon size={20} />
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

  const [, setCollapsing] = useState(false);
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
      <PanelGroup
        direction={'horizontal'}
        style={{ height: '100vh' }}
        onLayout={(newSizes: number[]) => setSizes(newSizes)}
      >
        <Panel
          collapsible
          ref={panelRef}
          defaultSize={sizes[0]}
          onResize={(size) => handleResize(0, size)}
          collapsedSize={0}
          maxSize={35}
          style={{ maxWidth: 320 }}
        >
          <Box h={'100%'} p={'md'} pr={'xs'}>
            <Stack
              h={'100%'}
              gap={0}
              style={{
                overflow: 'hidden',
                border: '1px solid var(--mantine-color-default-border)',
                borderRadius: 'var(--mantine-radius-lg)'
              }}
            >
              <Group gap={'xs'} py={'xs'} px={'sm'} wrap={'nowrap'}>
                <img src={favicon} width={20} alt={''} />
                <Text size={'xs'} fw={700}>
                  {getCopy('Main', 'interface_name')}
                </Text>
              </Group>
              <Divider />
              <GlobalMenuBar />
              <Divider />
              <Stack gap={'xs'} px={'md'} py={'xs'}>
                <ConnectionStatusIndicator />
                <Group gap={'xs'} wrap={'nowrap'}>
                  <Text size={'xs'} fw={700}>
                    {getCopy('Main', 'project_name')}
                  </Text>
                  <Text size={'sm'} c={'dimmed'}>
                    {projectName}
                  </Text>
                </Group>
                <Divider />
                <Undo />
                <Divider />
              </Stack>

              <Stack gap={'xs'} p={'xs'}>
                <Text size={'xs'} fw={700} ml={'xs'}>
                  {getCopy('Main', 'layout')}
                </Text>
                <LayoutToolbar />
                <Divider />
              </Stack>
              <ScrollArea
                type={'always'}
                flex={1}
                mih={0}
                style={{ containerType: 'inline-size', containerName: 'palette' }}
              >
                <Stack gap={'md'} p={'md'}>
                  <Text size={'xs'} fw={700}>
                    {getCopy('Main', 'static_components')}
                  </Text>
                  <SimpleGrid cols={2} className={classes.paletteGrid}>
                    {staticComponentTypes.map((v) => (
                      <Button
                        key={v.type}
                        size={'sm'}
                        justify={'space-between'}
                        leftSection={v.icon}
                        style={{ containerType: 'inline-size' }}
                        onClick={() => handleAddComponent(v.type)}
                      >
                        <span className={classes.componentButtonLabel}>{v.name}</span>
                      </Button>
                    ))}
                  </SimpleGrid>
                  <Text size={'xs'} fw={700}>
                    {getCopy('Main', 'preset_components')}
                  </Text>
                  <SimpleGrid cols={2} className={classes.paletteGrid}>
                    {presetComponentTypes.map((v) => (
                      <Button
                        key={v.type}
                        size={'sm'}
                        variant={'light'}
                        justify={'space-between'}
                        leftSection={v.icon}
                        style={{ containerType: 'inline-size' }}
                        onClick={() => handleAddComponent(v.type)}
                      >
                        <span className={classes.componentButtonLabel}>{v.name}</span>
                      </Button>
                    ))}
                  </SimpleGrid>
                  <SimpleGrid cols={2} className={classes.paletteGrid}>
                    {propertyComponentTypes.map((v) => (
                      <Button
                        key={v.type}
                        size={'sm'}
                        variant={'filled'}
                        justify={'space-between'}
                        leftSection={v.icon}
                        style={{ containerType: 'inline-size' }}
                        onClick={() => handleAddComponent(v.type)}
                      >
                        <span className={classes.componentButtonLabel}>{v.name}</span>
                      </Button>
                    ))}
                  </SimpleGrid>
                </Stack>
              </ScrollArea>
              <Divider />
              <Box p={'md'}>
                <Feedback />
              </Box>
            </Stack>
          </Box>
        </Panel>
        {!isPresentMode && (
          <PanelResizeHandle className={classes.resizeHandle}>
            <div className={classes.resizeGrip}>
              <GripVerticalIcon size={10} />
            </div>
          </PanelResizeHandle>
        )}
        <Panel defaultSize={sizes[1]} onResize={(size) => handleResize(1, size)}>
          <Box pos={'relative'} h={'100%'}>
            <Box h={'100%'} p={isPresentMode ? 0 : 'md'} pl={isPresentMode ? 0 : 'sm'}>
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
            </Box>
            <Group pos={'absolute'} bottom={28} left={24} gap={'xs'}>
              <ToggleButton
                tooltipText={getCopy('Main', 'navpanel')}
                icon={navType.icon}
                selected={NavPosition?.minimized}
                onClick={() => minimize(NavPosition)}
                disabled={connectionStatus != ConnectionStatus.Connected}
              />
              <ToggleButton
                tooltipText={getCopy('Main', 'timepanel')}
                icon={timeType.icon}
                selected={TimePosition?.minimized}
                onClick={() => minimize(TimePosition)}
                disabled={connectionStatus != ConnectionStatus.Connected}
              />
              <ToggleButton
                tooltipText={getCopy('Main', 'statuspanel')}
                icon={statusType.icon}
                selected={StatusPosition?.minimized}
                onClick={() => minimize(StatusPosition)}
                disabled={connectionStatus != ConnectionStatus.Connected}
              />
              <ToggleButton
                tooltipText={getCopy('Main', 'recordpanel')}
                icon={recordType.icon}
                selected={RecordPosition?.minimized}
                onClick={() => minimize(RecordPosition)}
                disabled={connectionStatus != ConnectionStatus.Connected}
              />
              <ToggleButton
                tooltipText={getCopy('Main', 'logpanel')}
                icon={logType.icon}
                selected={LogPosition?.minimized}
                onClick={() => minimize(LogPosition)}
                disabled={connectionStatus != ConnectionStatus.Connected}
              />
            </Group>
            {(!isPresentMode || (showPagination && isPresentMode)) && (
              <Pagination
                currentIndex={currentPageIndex}
                length={pagesLength}
                setIndex={goToPage}
              />
            )}
            <Box pos={'absolute'} bottom={28} right={24}>
              <PresentModeToggle />
            </Box>
          </Box>
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
        </Panel>
      </PanelGroup>
    </ThemeProvider>
  );
}

export default Editor;
