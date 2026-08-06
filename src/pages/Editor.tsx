import { useEffect, useRef, useState } from 'react';
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import { v4 as uuidv4 } from 'uuid';

import { Canvas } from '@/editor/canvas/Canvas';
import { getComponentTypes } from '@/editor/componentTypes';
import { LayoutEditModal } from '@/editor/sidebar/LayoutEditModal';
import { ComponentModal } from '@/editor/sidebar/modals/ComponentModal';
import { Sidebar } from '@/editor/sidebar/Sidebar';
import { GripVerticalIcon } from '@/icons/icons';
import { ComponentType, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

import classes from './Editor.module.css';

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

  const { allComponentTypes } = getComponentTypes();

  useEffect(() => {
    if (pagesLength == 0 && currentPage == '') {
      addPage();
    }
  }, []);

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
          <Sidebar onAddComponent={handleAddComponent} />
        </Panel>
        {!isPresentMode && (
          <PanelResizeHandle className={classes.resizeHandle}>
            <div className={classes.resizeGrip}>
              <GripVerticalIcon size={10} />
            </div>
          </PanelResizeHandle>
        )}
        <Panel defaultSize={sizes[1]} onResize={(size) => handleResize(1, size)}>
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
        </Panel>
      </PanelGroup>
    </ThemeProvider>
  );
}

export { Editor };
