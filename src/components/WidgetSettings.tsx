import { Group, SimpleGrid, Stack, Text, Textarea, TextInput } from '@mantine/core';

import { ColorPicker } from '@/components/ColorPicker';
import { Image } from '@/components/Image';
import { ImageUpload } from '@/components/ImageUpload';
import { Toggle as ToggleComponent } from '@/components/Toggle';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  guiName: string;
  setGuiName: (value: string) => void;
  guiDescription: string;
  setGuiDescription: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  backgroundImage: string;
  setBackgroundImage: (value: string) => void;
  lockName?: boolean;
  setLockName?: (value: boolean) => void;
}

// The name/background/description settings shared by every widget edit modal.
// The lock-name toggle is only rendered when lockName/setLockName are provided.
function WidgetSettings({
  guiName,
  setGuiName,
  guiDescription,
  setGuiDescription,
  color,
  setColor,
  backgroundImage,
  setBackgroundImage,
  lockName,
  setLockName
}: Props) {
  const nameInput = (
    <TextInput
      flex={3}
      id={'guiname'}
      label={getCopy('WidgetSettings', 'component_name')}
      placeholder={'Name of Component'}
      value={guiName}
      onChange={(e) => setGuiName(e.currentTarget.value)}
    />
  );

  return (
    <>
      {lockName !== undefined && setLockName ? (
        <Group align={'flex-end'} wrap={'nowrap'}>
          {nameInput}
          <ToggleComponent label={'Lock Name'} value={lockName} setValue={setLockName} />
        </Group>
      ) : (
        nameInput
      )}
      <Stack gap={'md'}>
        <SimpleGrid cols={2} spacing={'md'}>
          <Stack gap={'md'}>
            <Text size={'sm'} fw={500}>
              {getCopy('WidgetSettings', 'background_color')}
            </Text>
            <ColorPicker color={color} setColor={setColor} />
          </Stack>
          <Stack gap={'md'}>
            <Text size={'sm'} fw={500}>
              {getCopy('WidgetSettings', 'background_image')}
            </Text>
            <Image
              w={backgroundImage.length > 0 ? 128 : 64}
              h={backgroundImage.length > 0 ? 128 : 64}
              fit={'cover'}
              src={backgroundImage || ''}
              alt={'Loaded'}
            />
          </Stack>
        </SimpleGrid>
        <ImageUpload value={backgroundImage} onChange={setBackgroundImage} />
      </Stack>
      <Textarea
        id={'description'}
        label={getCopy('WidgetSettings', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </>
  );
}

export { WidgetSettings };
