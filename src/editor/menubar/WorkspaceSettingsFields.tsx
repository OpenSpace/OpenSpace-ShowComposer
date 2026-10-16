import { useTranslation } from 'react-i18next';
import { Text, TextInput, Title } from '@mantine/core';

export interface WorkspaceSettingsValues {
  ip: string;
  port: string;
}

interface Props {
  values: WorkspaceSettingsValues;
  onChange: (values: Partial<WorkspaceSettingsValues>) => void;
}

// The fields of the settings of the workspace, used by the modals for creating a show
// and for updating the workspace
export function WorkspaceSettingsFields({ values, onChange }: Props) {
  const { t } = useTranslation(['new-show-modal', 'connection-settings']);

  return (
    <>
      <Title order={3}>{t('connection-settings:openspace-connection')}</Title>
      <Text size={'sm'} c={'dimmed'}>
        {t('connection-settings:address-copy')}
      </Text>
      <TextInput
        label={t('ip-address')}
        size={'xs'}
        value={values.ip}
        onChange={(e) => onChange({ ip: e.currentTarget.value })}
        placeholder={t('ip-address-placeholder')}
      />
      <TextInput
        label={t('port')}
        size={'xs'}
        value={values.port}
        onChange={(e) => onChange({ port: e.currentTarget.value })}
        placeholder={t('port-placeholder')}
      />
    </>
  );
}
