import { useEffect, useState } from 'react';
import { Group, InputLabel, Stack, Textarea, TextInput } from '@mantine/core';

import BackgroundHolder from '@/components/BackgroundHolder';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import SelectableDropdown from '@/components/SelectableDropdown';
import ToggleComponent from '@/components/Toggle';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, PageComponent } from '@/types/components';
import { getCopy } from '@/utils/copyHelpers';

interface PageGUIProps {
  component: PageComponent;
  shouldRender?: boolean;
}

function PageGUIComponent({ component, shouldRender = true }: PageGUIProps) {
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const goToPage = useBoundStore((state) => state.goToPage);

  useEffect(() => {
    updateComponent(component.id, {
      triggerAction: () => {
        goToPage(component.page - 1);
      }
    });
  }, [component.page]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      <DisplayLabel>
        <Group gap={'xs'} wrap={'nowrap'}>
          {component.gui_name}
          <Information content={component.gui_description} />
        </Group>
      </DisplayLabel>
    </ComponentContainer>
  );
}

interface PageModalProps {
  component: PageComponent | null;
  handleComponentData: (data: Partial<PageComponent>) => void;
}

function PageModal({ component, handleComponentData }: PageModalProps) {
  const pages = useBoundStore((state) => state.pages);
  const [page, setPage] = useState<number>(component?.page || 1);
  const [guiName, setGuiName] = useState<string>(component?.gui_name || 'Go to Page 1');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.page
  );

  const handlePageChange = (page: number) => {
    setPage(page);
    if (!lockName) {
      const pageData = pages[page - 1];
      setGuiName(`Go to ${pageData.name ? pageData.name : 'Go to Page ' + page}`);
    }
  };

  useEffect(() => {
    handleComponentData({
      page,
      backgroundImage,
      gui_name: guiName,
      lockName,
      gui_description: guiDescription,
      color
    });
  }, [
    page,
    backgroundImage,
    guiName,
    lockName,
    guiDescription,
    color,
    handleComponentData
  ]);

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('Page', 'page_number')}</InputLabel>
        <SelectableDropdown
          options={pages.map((v, i) => ({
            value: (i + 1).toString(),
            label: v.name ? v.name : 'Page ' + (i + 1).toString()
          }))}
          selected={page.toString()}
          setSelected={(v: string) => handlePageChange(parseInt(v))}
        />
      </Stack>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Page', 'component_name')}
          placeholder={'Name of Component'}
          value={guiName}
          onChange={(e) => setGuiName(e.currentTarget.value)}
        />
        <ToggleComponent label={'Lock Name'} value={lockName} setValue={setLockName} />
      </Group>
      <BackgroundHolder
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
      <Textarea
        id={'description'}
        label={getCopy('Page', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { PageGUIComponent, PageModal };
