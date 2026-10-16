import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Group, Table, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';

import { confirmStoreImport } from '@/api/showbuilder';
import { componentsData } from '@/editor/componentsData';
import { type Position, useSettingsStore } from '@/store';
import { type BoundStoreState, useBoundStore } from '@/store/boundStore';
import type { SettingsStoreState } from '@/store/settingsStore';
import type { ComponentBase, LayoutBase, MultiComponent, Page } from '@/types/components';

type MultiOption = {
  component: MultiComponent['id'];
  buffer: number;
  startTime: number;
  endTime: number;
  chained: boolean;
};

type SelectedPage = {
  name: string;
  id: string;
  components: string[];
};

export interface LoadedStore {
  boundStore: BoundStoreState;
  settingsStore: SettingsStoreState;
  _tempImportId: string;
}

interface Props {
  store: LoadedStore;
  onClose: () => void;
}

export function ImportShowModal({ store, onClose }: Props) {
  const { t } = useTranslation('import-show-modal');
  const { t: tMain } = useTranslation('main');
  const { addPages, addComponents, addPositions, addLayouts } = useBoundStore();
  const setProjectSettings = useSettingsStore((state) => state.setProjectSettings);
  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);
  const initialState = useSettingsStore((state) => ({
    ip: state.ip || '',
    port: state.port || '',
    pageHeight: state.pageHeight || 1920,
    pageWidth: state.pageWidth || 1080,
    projectName: '',
    projectDescription: ''
  }));

  const [pages, setPages] = useState<SelectedPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<SelectedPage[]>([]);

  useEffect(() => {
    if (store && store.boundStore) {
      const parsedPages = store.boundStore.pages.map((page: Page, index: number) => {
        return {
          name: page.name || `${index + 1}`,
          components: page.components,
          id: page.id
        };
      });
      setPages(parsedPages);
    }
  }, [store]);

  async function closeWithConfirmation(confirm: boolean) {
    try {
      await confirmStoreImport(confirm, store._tempImportId);
      onClose();
    } catch (error) {
      console.error('Error confirming show import:', error);
    }
  }

  function handleSelectAll(isChecked: boolean) {
    const newSelectedPages: SelectedPage[] = [];
    if (isChecked) {
      pages.forEach((page, index) => {
        newSelectedPages.push({
          name: `${index + 1}`,
          id: page.id,
          components: page.components
        });
      });
    }
    setSelectedPages(newSelectedPages);
  }

  function handlePageSelect(page: SelectedPage) {
    let newSelectedPages = [...selectedPages];
    if (newSelectedPages.find((p) => p.id === page.id)) {
      newSelectedPages = newSelectedPages.filter((p) => p.id !== page.id);
    } else {
      newSelectedPages.push(page);
    }
    setSelectedPages(newSelectedPages);
  }

  async function handleImport() {
    // Logic to import selected pages/components
    useBoundStore.setState(store.boundStore);
    useSettingsStore.setState(store.settingsStore);
    await closeWithConfirmation(true);
    // onClose();
  }

  async function handleImportToCurrentShow() {
    const selectedComponents = new Set<ComponentBase>();
    const selectedPositions = new Set<Position>();
    const selectedLayouts = new Set<LayoutBase>();
    const selectedFullPages = new Set<Page>();
    const idMap: Record<string, string> = {};

    selectedPages.forEach((selectedPage) => {
      const page: Page | undefined = store.boundStore.pages.find(
        (p: Page) => p.id === selectedPage.id
      );
      if (page) {
        idMap[page.id] = uuidv4();
        selectedFullPages.add(page);
        // Add components from the selected page
        page.components.forEach((componentId: string) => {
          const component = store.boundStore.components[componentId];
          const layout = store.boundStore.layouts[componentId];
          if (component) {
            idMap[componentId] = uuidv4();
            selectedComponents.add(component);
            if (component.type === 'multi') {
              // If it's a multi-component, add its child components
              (component as MultiComponent).components.forEach((child: MultiOption) => {
                const component = store.boundStore.components[child.component];
                if (component) {
                  idMap[child.component] = uuidv4();
                  selectedComponents.add(component);
                }
                //   selectedComponents.add(childId);
              });
            }
          }
          if (layout) {
            idMap[componentId] = uuidv4();
            selectedLayouts.add(layout);
          }
          // Add positions for the components in the page
        });
        page.components.forEach((componentId: string) => {
          const position = store.boundStore.positions[componentId];
          if (position) {
            selectedPositions.add(position);
          }
        });
      }
    });

    // Function to replace old IDs with new IDs based on the idMap
    function replaceIdsInString(
      items: ComponentBase[] | Position[] | LayoutBase[] | Page[]
    ) {
      const jsonString = JSON.stringify(items);
      let updatedString = jsonString;

      // Replace old IDs with new IDs in the string
      Object.keys(idMap).forEach((oldId) => {
        const newId = idMap[oldId];
        const regex = new RegExp(`"${oldId}"`, 'g'); // Create a regex to match the old ID
        updatedString = updatedString.replace(regex, `"${newId}"`); // Replace with new ID
      });

      return JSON.parse(updatedString); // Parse the updated string back to an object/array
    }

    // Replace IDs in the arrays before adding to the store
    const updatedFullPages = replaceIdsInString(Array.from(selectedFullPages));
    const updatedComponents = replaceIdsInString(Array.from(selectedComponents));
    const updatedPositions = replaceIdsInString(Array.from(selectedPositions));
    const updatedLayouts = replaceIdsInString(Array.from(selectedLayouts));

    addPages(updatedFullPages);
    addComponents(updatedComponents);
    addPositions(updatedPositions);
    addLayouts(updatedLayouts);
    await closeWithConfirmation(true);
  }

  async function handleImportToNewShow() {
    const selectedComponents = new Set<ComponentBase>();
    const selectedPositions = new Set<Position>();
    const selectedLayouts = new Set<LayoutBase>();
    const selectedFullPages = new Set<Page>();

    selectedPages.forEach((selectedPage) => {
      const page: Page | undefined = store.boundStore.pages.find(
        (p: Page) => p.id === selectedPage.id
      );
      if (page) {
        selectedFullPages.add(page);
        // Add components from the selected page
        page.components.forEach((componentId: string) => {
          const component = store.boundStore.components[componentId];
          const layout = store.boundStore.layouts[componentId];
          if (component) {
            selectedComponents.add(component);
            if (component.type === 'multi') {
              // If it's a multi-component, add its child components
              (component as MultiComponent).components.forEach((child: MultiOption) => {
                const component = store.boundStore.components[child.component];
                if (component) {
                  selectedComponents.add(component);
                }
                //   selectedComponents.add(childId);
              });
            }
          }
          if (layout) {
            selectedLayouts.add(layout);
          }
          // Add positions for the components in the page
        });
        page.components.forEach((componentId: string) => {
          const position = store.boundStore.positions[componentId];
          if (position) {
            selectedPositions.add(position);
          }
        });
      }
    });

    // useSettingsStore.setState(store.settingsStore);
    removeAllComponents();
    useBoundStore.setState({
      pages: Array.from(selectedFullPages),
      currentPage: selectedFullPages.values().next().value?.id || '',
      currentPageIndex: 0
    });

    // addPages(Array.from(selectedFullPages));
    addComponents(Array.from(selectedComponents));
    addPositions(Array.from(selectedPositions));
    addLayouts(Array.from(selectedLayouts)); // Assuming you have a method to add layouts

    setProjectSettings({
      ...initialState,
      projectName: '',
      projectDescription: ''
    });
    //open new project settings

    await closeWithConfirmation(true);
    // onClose();
  }

  return (
    <>
      <Text>{t('description')}</Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Checkbox
                checked={selectedPages.length === pages.length}
                onChange={(event) => handleSelectAll(event.currentTarget.checked)}
              />
            </Table.Th>
            <Table.Th>{t('page')}</Table.Th>
            <Table.Th>{t('components')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pages.map((page) => {
            const isSelected = selectedPages.find((p) => p.id === page.id) !== undefined;
            return (
              <Table.Tr
                key={page.name}
                onClick={() => handlePageSelect(page)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? 'var(--mantine-color-default-hover)'
                    : undefined
                }}
              >
                <Table.Td>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handlePageSelect(page)}
                  />
                </Table.Td>
                <Table.Td>{page.name}</Table.Td>
                <Table.Td>
                  {page.components
                    .filter((v) => !store.boundStore.layouts[v])
                    .map((componentId, index) => {
                      const component = store.boundStore.components[componentId];
                      const nameKey = component
                        ? componentsData[component.type]?.nameKey
                        : undefined;
                      return (
                        <Text span key={componentId} c={'dimmed'}>
                          {component && component.gui_name?.length > 0
                            ? component.gui_name
                            : nameKey
                              ? tMain(nameKey)
                              : ''}
                          {index <
                          page.components.filter((v) => !store.boundStore.layouts[v])
                            .length -
                            1
                            ? ', '
                            : ''}
                        </Text>
                      );
                    })}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <Group justify={'flex-end'} mt={'md'}>
        <Button
          variant={'default'}
          onClick={async () => await closeWithConfirmation(false)}
        >
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleImportToNewShow}>
          {t('import-to-new-show')}
        </Button>
        <Button variant={'filled'} onClick={handleImportToCurrentShow}>
          {t('import-to-current-show')}
        </Button>
        <Button variant={'filled'} onClick={handleImport}>
          {t('import-full-show')}
        </Button>
      </Group>
    </>
  );
}
