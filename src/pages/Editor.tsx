import { useEffect, useState } from 'react';
import { ActionIcon, Box, Flex } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';

import { Canvas } from '@/editor/canvas/Canvas';
import { getComponentTypes } from '@/editor/componentTypes';
import { LayoutEditModal } from '@/editor/sidebar/LayoutEditModal';
import { ComponentModal } from '@/editor/sidebar/modals/ComponentModal';
import { Sidebar } from '@/editor/sidebar/Sidebar';
import { ChevronLeftIcon, ChevronRightIcon } from '@/icons/icons';
import { ComponentType, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

// The sidebar behaves as a push-drawer: it is either fully open at this width or
// fully collapsed to zero, never a partial width.
const SIDEBAR_WIDTH = 320;

function Editor() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [currentComponentId, setCurrentComponentId] = useState<string | null>(null);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
  const [currentComponentType, setCurrentComponentType] = useState<ComponentType | ''>(
    ''
  );

  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const addPage = useBoundStore((state) => state.addPage);
  const currentPage = useBoundStore((state) => state.currentPage);
  const pagesLength = useBoundStore((state) => state.pages?.length);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { allComponentTypes } = getComponentTypes();

  useEffect(() => {
    if (pagesLength == 0 && currentPage == '') {
      addPage();
    }
  }, []);

  // Present mode hides the sidebar entirely; leaving it restores the drawer.
  useEffect(() => {
    setSidebarOpen(!isPresentMode);
  }, [isPresentMode]);

  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    setIsModalOpen(true);
  };

  const handleEditComponent = (id: string) => {
    setCurrentComponentId(id);
    setIsModalOpen(true);
  };

  const handleEditLayout = (id: string) => {
    setCurrentLayoutId(id);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentComponentId(null);
  };

  return (
    <ThemeProvider defaultTheme={'dark'} storageKey={'vite-ui-theme'}>
      <Flex h={'100vh'} w={'100%'} style={{ overflow: 'hidden' }}>
        <Box
          style={{
            flex: `0 0 ${sidebarOpen ? SIDEBAR_WIDTH : 0}px`,
            width: sidebarOpen ? SIDEBAR_WIDTH : 0,
            overflow: 'hidden',
            transition: 'flex-basis 300ms ease, width 300ms ease'
          }}
        >
          <Box w={SIDEBAR_WIDTH} h={'100%'}>
            <Sidebar onAddComponent={handleAddComponent} />
          </Box>
        </Box>
        <Box pos={'relative'} style={{ flex: 1, minWidth: 0 }} h={'100%'}>
          {!isPresentMode && (
            <ActionIcon
              variant={'default'}
              radius={'xs'}
              w={20}
              miw={20}
              h={40}
              onClick={() => setSidebarOpen((open) => !open)}
              pos={'absolute'}
              top={'50%'}
              left={0}
              style={{
                transform: sidebarOpen ? 'translate(-50%, -50%)' : 'translateY(-50%)',
                transition: 'transform 300ms ease',
                zIndex: 50
              }}
            >
              {sidebarOpen ? (
                <ChevronLeftIcon size={14} />
              ) : (
                <ChevronRightIcon size={14} />
              )}
            </ActionIcon>
          )}
          <Canvas onEditComponent={handleEditComponent} onEditLayout={handleEditLayout} />
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
        </Box>
      </Flex>
    </ThemeProvider>
  );
}

export { Editor };
