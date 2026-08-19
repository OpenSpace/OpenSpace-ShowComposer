import { useTranslation } from 'react-i18next';
import { SimpleGrid, Stack, Text, Textarea, TextInput } from '@mantine/core';

import { ColorPicker } from '@/components/ColorPicker';
import { Image } from '@/components/Image';
import { ImageUpload } from '@/components/ImageUpload/ImageUpload';

export interface Placeholders {
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
  placeholders: Placeholders;
}

function WidgetSettings({ data, handleData, placeholders }: Props) {
  const { t } = useTranslation('widget-settings');
  const backgroundImage = data.backgroundImage ?? '';

  return (
    <>
      <TextInput
        id={'guiname'}
        label={t('component-name')}
        placeholder={placeholders.name || 'Name of Component'}
        value={data.gui_name ?? ''}
        onChange={(e) => handleData({ gui_name: e.currentTarget.value })}
      />
      <Stack gap={'md'}>
        <SimpleGrid cols={2} spacing={'md'}>
          <Stack gap={'md'}>
            <Text size={'sm'} fw={500}>
              {t('background-color')}
            </Text>
            <ColorPicker
              color={data.color ?? ''}
              setColor={(v) => handleData({ color: v })}
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
              alt={'Loaded'}
            />
          </Stack>
        </SimpleGrid>
        <ImageUpload
          value={backgroundImage}
          onChange={(v) => handleData({ backgroundImage: v })}
        />
      </Stack>
      <Textarea
        id={'description'}
        label={t('gui-description')}
        value={data.gui_description ?? ''}
        onChange={(e) => handleData({ gui_description: e.currentTarget.value })}
        placeholder={placeholders.description || 'Type your message here.'}
      />
    </>
  );
}

export { WidgetSettings };
