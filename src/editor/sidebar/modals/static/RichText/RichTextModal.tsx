import { useState } from 'react';
import { InputLabel, Stack } from '@mantine/core';

import { ColorPicker } from '@/components/ColorPicker';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { RichTextComponent } from '@/store';
import { ComponentBaseColors } from '@/types/components';

import { RichTextEditor } from './RichTextEditor';

const DEFAULTS: Omit<RichTextComponent, 'id'> = {
  type: 'richtext',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  text: '',
  color: ComponentBaseColors.richtext
};

function RichTextModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'richtext'>) {
  const [data, setData] = useState<RichTextComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const { text } = data;
  const color = data.color ?? ComponentBaseColors.richtext;

  function handleData(patch: Partial<RichTextComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>Background Color</InputLabel>
        <ColorPicker color={color} setColor={(v) => handleData({ color: v })} />
      </Stack>
      <RichTextEditor content={text} setContent={(v) => handleData({ text: v })} />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { RichTextModal };
