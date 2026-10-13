import { useTranslation } from 'react-i18next';
import { SimpleGrid, Stack, Text, Textarea, TextInput } from '@mantine/core';

import { ColorPicker } from '@/components/ColorPicker';
import { Image } from '@/components/Image';
import { ImageUpload } from '@/components/ImageUpload/ImageUpload';

export interface Placeholder {
  name: string;
  description: string;
}

type WidgetSettingsData = {
  gui_name?: string;
  gui_description?: string;
  color?: string;
  backgroundImage?: string;
};

interface Props {
  data: WidgetSettingsData;
  handleData: (patch: WidgetSettingsData) => void;
  placeholder: Placeholder;
}

export function WidgetSettings({ data, handleData, placeholder }: Props) {
  const { t } = useTranslation('widget-settings');
  const backgroundImage = data.backgroundImage ?? '';

  return (
    <>
      <TextInput
        id={'guiname'}
        label={t('component-name')}
        placeholder={placeholder.name || t('name-placeholder')}
        value={data.gui_name ?? ''}
        onChange={(event) => handleData({ gui_name: event.currentTarget.value })}
      />
      <Stack gap={'md'}>
        <SimpleGrid cols={2} spacing={'md'}>
          <Stack gap={'md'}>
            <Text size={'sm'} fw={500}>
              {t('background-color')}
            </Text>
            <ColorPicker
              color={data.color ?? ''}
              setColor={(value) => handleData({ color: value })}
            />
          </Stack>
          <Stack gap={'md'}>
            <Text size={'sm'} fw={500}>
              {t('background-image')}
            </Text>
            <Image
              w={backgroundImage.length > 0 ? 128 : 64}
              h={backgroundImage.length > 0 ? 128 : 64}
              fit={'cover'}
              src={backgroundImage}
              alt={t('background-image-alt')}
            />
          </Stack>
        </SimpleGrid>
        <ImageUpload
          value={backgroundImage}
          onChange={(value) => handleData({ backgroundImage: value })}
        />
      </Stack>
      <Textarea
        id={'description'}
        label={t('gui-description')}
        value={data.gui_description ?? ''}
        onChange={(e) => handleData({ gui_description: e.currentTarget.value })}
        placeholder={placeholder.description || t('description-placeholder')}
      />
    </>
  );
}
