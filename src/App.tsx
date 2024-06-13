import { useState } from 'react';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import ComponentModal from './components/ComponentModal';
import DraggableComponent from './components/DraggableComponent';
import DroppableWorkspace from './components/DroppableWorkspace';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

import {
  ComponentType,
  loadStore,
  saveStore,
  useComponentStore,
  useSettingsStore,
} from './store';
import { v4 as uuidv4 } from 'uuid';
import { toTitleCase } from './utils/math';
import PresentModeToggle from './components/PresentModeToggle';
import SettingsMenu from './components/SettingsMenu';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [currentComponentId, setCurrentComponentId] = useState<string | null>(
    null,
  );
  const [currentComponentType, setCurrentComponentType] = useState<
    ComponentType | ''
  >('');

  const components = useComponentStore((state) => state.components);
  const removeAllComponents = useComponentStore(
    (state) => state.removeAllComponents,
  );
  const removeComponent = useComponentStore((state) => state.removeComponent);
  const isPresentMode = useSettingsStore((state) => state.presentMode);

  const presetComponentTypes: Array<ComponentType> = [
    'fade',
    'richtext',
    'title',
    'video',
    'image',
  ];

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

  const handleDeleteComponent = (id: string) => {
    removeComponent(id);
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllModalOpen(true);
  };

  const handleDeleteAllConfirm = () => {
    removeAllComponents();
    setIsDeleteAllModalOpen(false);
  };

  const handleDeleteAllCancel = () => {
    setIsDeleteAllModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentComponentId(null);
  };

  return (
    <>
      <div className="flex h-screen">
        <PresentModeToggle />
        <SettingsMenu />
        <div className="flex w-full">
          {!isPresentMode && (
            <button
              className="fixed left-8 top-8 z-40 rounded-full bg-gray-800 p-4 text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {/* svg hamburger menu */}
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
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          )}

          <div
            className={`fixed left-0 top-0 z-30 h-full w-1/4 transform overflow-auto bg-gray-800 text-white transition-all duration-300 ease-in-out ${
              isSidebarOpen && !isPresentMode
                ? 'translate-x-0'
                : '-translate-x-full'
            }`}
          >
            {!isPresentMode && (
              <div className="h-full w-full bg-gray-200 p-4">
                <h2 className="text-xl font-bold">Youth Learner Interface</h2>
                <div className="mt-4 flex gap-2">
                  <button
                    className="rounded bg-black p-2 text-white"
                    onClick={saveStore}
                  >
                    Save
                  </button>
                  <button
                    className="rounded bg-black p-2 text-white"
                    onClick={loadStore}
                  >
                    Load Project
                  </button>
                </div>
                <div className="flex h-full flex-col">
                  <h2 className="mt-4 text-xs font-bold">Preset Components</h2>
                  <div className="mt-4">
                    {presetComponentTypes.map((type) => (
                      <button
                        key={type}
                        className="mb-2 w-full rounded bg-green-500 p-2 text-white"
                        onClick={() => handleAddComponent(type)}
                      >
                        Add {toTitleCase(type as string)}
                      </button>
                    ))}
                  </div>
                  <div className="fixed bottom-0">
                    <button
                      className="mb-2 w-full rounded bg-red-500 p-2 text-white"
                      onClick={handleDeleteAllClick}
                    >
                      Delete All Components
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className={`flex flex-1 ${
              isSidebarOpen && !isPresentMode ? 'ml-[25vw]' : 'ml-0'
            } transition-all duration-300 `}
          >
            <div
              className={`flex-1 bg-gray-100 ${isPresentMode ? 'p-0' : 'p-4'} `}
            >
              {!isPresentMode && (
                <h2 className="text-xl font-bold">Workspace</h2>
              )}
              <div
                className="relative mt-4 h-full rounded border bg-white"
                style={{
                  marginTop: isPresentMode ? 0 : '1rem',
                }}
              >
                <DroppableWorkspace>
                  {components.map((component) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                      onEdit={() => handleEditComponent(component.id)}
                      onDelete={() => handleDeleteComponent(component.id)}
                    />
                  ))}
                </DroppableWorkspace>
              </div>
            </div>
          </div>
          <ComponentModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            componentId={currentComponentId}
            type={currentComponentType}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteAllModalOpen}
            onClose={handleDeleteAllCancel}
            onConfirm={handleDeleteAllConfirm}
            message="Are you sure you want to delete all components?"
          />
        </div>
      </div>
    </>
  );
};

export default App;
