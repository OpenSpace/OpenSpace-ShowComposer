import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  NumberInput,
  Select,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';

export interface ShowSettingsValues {
  showName: string;
  showDescription: string;
  showPagination: boolean;
  pageWidth: number;
  pageHeight: number;
}

interface Props {
  values: ShowSettingsValues;
  onChange: (values: Partial<ShowSettingsValues>) => void;
}

// The fields of the settings of a show, used by the modals for creating and updating one
export function ShowSettingsFields({ values, onChange }: Props) {
  const { t } = useTranslation('new-show-modal');

  const [isCustomSize, setIsCustomSize] = useState(false);

  const presets = [
    { value: 'hd', label: t('hd'), width: 1920, height: 1080 },
    { value: 'ipad-landscape', label: t('ipad-landscape'), width: 1366, height: 1024 },
    { value: 'ipad-portrait', label: t('ipad-portrait'), width: 1024, height: 1366 }
  ];
  const customPreset = { value: 'custom', label: t('custom') };
  // The preset the current size matches, unless custom is chosen
  const currentPreset = isCustomSize
    ? undefined
    : presets.find(
        (preset) =>
          preset.width === values.pageWidth && preset.height === values.pageHeight
      );

  function toNumber(value: string | number) {
    return typeof value === 'number' ? value : parseInt(value);
  }

  return (
    <>
      <TextInput
        label={t('show-name')}
        value={values.showName}
        onChange={(e) => onChange({ showName: e.currentTarget.value })}
        placeholder={t('show-name-placeholder')}
      />
      <Textarea
        label={t('show-description')}
        value={values.showDescription}
        onChange={(e) => onChange({ showDescription: e.currentTarget.value })}
        placeholder={t('show-description-placeholder')}
      />
      <Checkbox
        label={t('show-pagination')}
        checked={values.showPagination}
        onChange={(event) => onChange({ showPagination: event.currentTarget.checked })}
      />
      <Title order={3}>{t('page-size')}</Title>
      <Text size={'sm'} c={'dimmed'}>
        {t('page-size-copy')}
      </Text>
      <Select
        label={t('page-preset')}
        size={'xs'}
        allowDeselect={false}
        data={[...presets, customPreset]}
        value={currentPreset?.value ?? customPreset.value}
        onChange={(value) => {
          const preset = presets.find((p) => p.value === value);
          setIsCustomSize(!preset);
          if (preset) {
            onChange({ pageWidth: preset.width, pageHeight: preset.height });
          }
        }}
      />
      <NumberInput
        label={t('page-width')}
        size={'xs'}
        allowDecimal={false}
        value={values.pageWidth}
        onChange={(value) => {
          setIsCustomSize(false);
          onChange({ pageWidth: toNumber(value) });
        }}
        placeholder={t('page-width-placeholder')}
      />
      <NumberInput
        label={t('page-height')}
        size={'xs'}
        allowDecimal={false}
        value={values.pageHeight}
        onChange={(value) => {
          setIsCustomSize(false);
          onChange({ pageHeight: toNumber(value) });
        }}
        placeholder={t('page-height-placeholder')}
      />
    </>
  );
}
