import { Group, Textarea, TextInput } from '@mantine/core';

import BackgroundPicker from '@/components/BackgroundPicker';
import ToggleComponent from '@/components/Toggle';
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
      <BackgroundPicker
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
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
