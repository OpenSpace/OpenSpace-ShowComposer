import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Group } from '@mantine/core';

import { Pagination } from '@/components/Pagination';
import { ToggleButton } from '@/components/ToggleButton';
import { useConnectionStatus } from '@/hooks/util';
import {
  ClockIcon,
  CompassIcon,
  MessageSquareWarningIcon,
  VideoIcon,
  ViewIcon
} from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { Position } from '@/store/positionSlice';
import { MultiComponent } from '@/types/components';
import { ConnectionStatus } from '@/types/enums';

import { DraggableComponent } from './DraggableComponent';
import { DraggablePanel } from './DraggablePanel';
import { DroppableWorkspace } from './DroppableWorkspace';
import { LayoutContainer } from './LayoutContainer';
import { PresentModeToggle } from './PresentModeToggle';

interface Props {
  onEditComponent: (id: string) => void;
  onEditLayout: (id: string) => void;
}

export function Canvas({ onEditComponent, onEditLayout }: Props) {
  const { t } = useTranslation('main');
  const components = useBoundStore((state) => state.components);
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
  const layouts = useBoundStore((state) => state.layouts);
  const currentPage = useBoundStore((state) => state.currentPage);
  const currentPageIndex = useBoundStore((state) => state.currentPageIndex);
  const pagesLength = useBoundStore((state) => state.pages?.length);
  const goToPage = useBoundStore((state) => state.goToPage);

  const connectionStatus = useConnectionStatus();

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

  const minimize = (position: Position | null) => {
    updatePosition(position?.id || '', {
      minimized: !position?.minimized
    });
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

  return (
    <Box pos={'relative'} h={'100%'}>
      <Box h={'100%'} p={isPresentMode ? 0 : 'md'} pl={isPresentMode ? 0 : 'xs'}>
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
                handleOpenEditModal={() => onEditLayout(layoutId)}
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
                      onEdit={() => onEditComponent(childId)}
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
                onEdit={() => onEditComponent(componentId)}
                onDelete={() => handleDeleteComponent(componentId)}
                onCopy={() => handleCopyComponent(componentId)}
              />
            );
          })}
        </DroppableWorkspace>
      </Box>
      <Group pos={'absolute'} bottom={28} left={24} gap={'xs'}>
        <ToggleButton
          tooltipText={t('nav-panel')}
          icon={<CompassIcon size={20} />}
          selected={NavPosition?.minimized}
          onClick={() => minimize(NavPosition)}
          disabled={connectionStatus != ConnectionStatus.Connected}
        />
        <ToggleButton
          tooltipText={t('time-panel')}
          icon={<ClockIcon size={20} />}
          selected={TimePosition?.minimized}
          onClick={() => minimize(TimePosition)}
          disabled={connectionStatus != ConnectionStatus.Connected}
        />
        <ToggleButton
          tooltipText={t('status-panel')}
          icon={<ViewIcon size={20} />}
          selected={StatusPosition?.minimized}
          onClick={() => minimize(StatusPosition)}
          disabled={connectionStatus != ConnectionStatus.Connected}
        />
        <ToggleButton
          tooltipText={t('record-panel')}
          icon={<VideoIcon size={20} />}
          selected={RecordPosition?.minimized}
          onClick={() => minimize(RecordPosition)}
          disabled={connectionStatus != ConnectionStatus.Connected}
        />
        <ToggleButton
          tooltipText={t('log-panel')}
          icon={<MessageSquareWarningIcon size={20} />}
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
  );
}
