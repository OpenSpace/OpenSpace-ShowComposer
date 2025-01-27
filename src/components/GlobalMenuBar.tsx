import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Label } from './ui/label';
import { getCopy } from '@/utils/copyHelpers';
import { Input } from './ui/input';
import ImportShowModal from './ImportShowModal';
import { loadStore, saveStore } from '@/utils/saveProject';
import { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useBoundStore, useBoundStoreTemporal } from '@/store/boundStore';
import NewProjectModal from './NewProjectModal';
import { useSettingsStore } from '@/store/settingsStore';

export function GlobalMenuBar() {
  const [loadedStore, setLoadedStore] = useState<any>(null);
  const [isImportShowModalOpen, setIsImportShowModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state,
  );
  const addPage = useBoundStore((state) => state.addPage);
  const deletePage = useBoundStore((state) => state.deletePage);
  const currentPage = useBoundStore((state) => state.currentPage);

  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const updatePageSize = useSettingsStore((state) => state.updatePageSize);
  const pageSizes = [
    {
      name: '1080',
      width: 1920,
      height: 1080,
    },
    {
      name: 'iPad Landscape',
      width: 1366,
      height: 1024,
    },
    {
      name: 'iPad Portrait',
      width: 1024,
      height: 1366,
    },
  ];

  const removeAllComponents = useBoundStore(
    (state) => state.removeAllComponents,
  );

  const handleLoadStore = async () => {
    try {
      const store = await loadStore();
      console.log('Loaded store:', store);
      setLoadedStore(store); // Store the loaded data
      setIsImportShowModalOpen(true); // Open the import modal
    } catch (error) {
      console.error('Error loading store:', error);
    }
  };

  const handleDeleteAllConfirm = () => {
    removeAllComponents();
    setIsDeleteAllModalOpen(false);
  };

  return (
    <>
      <Menubar className="border-0 p-2">
        <MenubarMenu>
          <MenubarTrigger>
            {/* <PlusCircleIcon size={20} /> */}
            File
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsNewProjectModalOpen(true)}>
              New Show
            </MenubarItem>
            <MenubarItem onClick={handleLoadStore}>Import</MenubarItem>
            <MenubarItem onClick={saveStore}>Export</MenubarItem>
            <MenubarItem
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="text-red-500"
            >
              Delete Show
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Settings</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsNewProjectModalOpen(true)}>
              Show Settings <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => setIsNewProjectModalOpen(true)}>
              Workspace Settings <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Page</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => addPage()}>Add Page</MenubarItem>
            <MenubarItem onClick={() => deletePage(currentPage)}>
              Delete Page
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Page Presets</MenubarSubTrigger>
              <MenubarSubContent>
                {pageSizes.map((page) => (
                  <MenubarItem
                    onClick={() => updatePageSize(page.width, page.height)}
                    key={page.name}
                  >
                    {page.name}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <div className="grid gap-2 p-2">
              <div className="space-between flex flex-row items-center gap-4">
                <Label htmlFor="port">
                  {getCopy('PageButtonMenu', 'width')}
                </Label>
                <Input
                  id="width"
                  className="h-8 w-40"
                  type="number"
                  value={pageWidth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updatePageSize(parseInt(e.target.value), pageHeight);
                  }}
                  placeholder="Enter Page Width"
                />
              </div>
              <div className="flex flex-row  items-center gap-4">
                <Label htmlFor="port">
                  {getCopy('PageButtonMenu', 'height')}
                </Label>
                <Input
                  id="height"
                  className="h-8 w-40"
                  type="number"
                  value={pageHeight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updatePageSize(pageWidth, parseInt(e.target.value));
                  }}
                  placeholder="Enter Page Height"
                />
              </div>
            </div>
            <MenubarSeparator />
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>History</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => undo()} disabled={!pastStates.length}>
              {/* <Undo /> */}
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => redo()} disabled={!futureStates.length}>
              {/* <Redo /> */}
              Redo
              <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => clear()}>Clear History</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <ImportShowModal
        isOpen={isImportShowModalOpen}
        onClose={() => setIsImportShowModalOpen(false)}
        store={loadedStore} // Pass the loaded store to the modal
      />
      <DeleteConfirmationModal
        onConfirm={handleDeleteAllConfirm}
        message="This action cannot be undone. This will permanently delete the components from the project."
        isOpen={isDeleteAllModalOpen}
        setOpen={setIsDeleteAllModalOpen}
      />
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        setIsOpen={setIsNewProjectModalOpen}
      />
    </>
  );
}

export default GlobalMenuBar;
