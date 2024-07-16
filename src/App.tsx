import { useEffect, useState } from 'react';
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
import PresentModeToggle from './components/PresentModeToggle';
import SettingsMenu from './components/SettingsMenu';
import ConnectionSettings from './components/ConnectionSettings';
import SubscriptionPanel from './components/SubscriptionPanel';
import BottomDrawer from './components/common/BottomDrawer';
import Pagination from './components/Pagination';
import { MultiComponent, MultiState } from './store/componentsStore';

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
    ['navpanel', 'Navigation Panel'],
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

  const handleDeleteAllCancel = () => {
    setIsDeleteAllModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentComponentId(null);
  };

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden">
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
            className={`fixed left-0 top-0 z-30 h-full w-1/4 max-w-[400px] transform overflow-auto bg-gray-800 text-white transition-all duration-300 ease-in-out ${
              isSidebarOpen && !isPresentMode
                ? 'translate-x-0'
                : '-translate-x-full'
            }`}
          >
            {!isPresentMode && (
              <div className="h-full w-full bg-gray-200 p-4">
                <h2 className="text-xl font-bold text-black">
                  Youth Learner Interface
                </h2>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
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
                  {/* <ImageUpload /> */}
                  <ConnectionSettings />
                </div>
                <div className="flex h-full flex-col">
                  <h2 className="mt-4 text-xs font-bold text-black">
                    Static Components
                  </h2>
                  <div className="mt-4 flex flex-row flex-wrap justify-between gap-2">
                    {staticComponentTypes.map((type) => (
                      <button
                        key={type[0]}
                        className="flex min-w-[165px] flex-row items-center rounded border-[1px] border-black bg-white p-2 text-black"
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
                      </button>
                    ))}
                  </div>
                  <h2 className="mt-4 text-xs font-bold text-black">
                    Preset Components
                  </h2>
                  <div className="mt-4 flex flex-row flex-wrap justify-between gap-2">
                    {presetComponentTypes.map((type) => (
                      <button
                        key={type[0]}
                        className="flex min-w-[165px] flex-row items-center rounded border-[1px] border-black bg-white p-2 text-black"
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
                      </button>
                    ))}
                  </div>
                  <h2 className="mt-4 text-xs font-bold text-black">
                    Property Components
                  </h2>
                  <div className="mt-4 flex flex-row flex-wrap justify-between gap-2">
                    {propertyComponentTypes.map((type) => (
                      <button
                        key={type[0]}
                        className="flex min-w-[165px] flex-row items-center rounded border-[1px] border-black bg-white p-2 text-black"
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
                      </button>
                    ))}
                  </div>
                  <div className="fixed bottom-0">
                    <button
                      className="mb-2 w-auto rounded bg-red-500 p-2 text-white"
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
            className={`right relative flex flex-1 flex-col gap-4 bg-gray-100 ${
              isSidebarOpen && !isPresentMode ? 'ml-[25vw] ' : 'ml-0'
            } ${isPresentMode ? 'p-0' : 'p-4'} transition-all duration-300 `}
          >
            {!isPresentMode && <h2 className="text-xl font-bold">Workspace</h2>}
            <div className={`flex-1`}>
              <div
                className=" m-0 h-full w-full rounded border bg-white "
                style={
                  {
                    // marginTop: isPresentMode ? 0 : '1rem',
                  }
                }
              >
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
            </div>

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
