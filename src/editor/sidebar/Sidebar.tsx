import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Divider,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text
} from '@mantine/core';

import favicon from '@/assets/images/favicon.png';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { NavigationInfo } from '@/components/NavigationInfo';
import { componentPalette } from '@/editor/componentsData';
import { GlobalMenuBar } from '@/editor/menubar/GlobalMenuBar';
import { LayoutToolbar } from '@/editor/sidebar/LayoutToolbar';
import { Undo } from '@/editor/sidebar/Undo';
import { type ComponentType, useSettingsStore } from '@/store';

import classes from './Sidebar.module.css';

interface Props {
  onAddComponent: (type: ComponentType) => void;
}

export function Sidebar({ onAddComponent }: Props) {
  const { t } = useTranslation('main');
  const showName = useSettingsStore((state) => state.projectName);
  const staticComponentTypes = componentPalette.filter((d) => d.group === 'static');
  const presetComponentTypes = componentPalette.filter((d) => d.group === 'preset');
  const propertyComponentTypes = componentPalette.filter((d) => d.group === 'property');

  return (
    <Box h={'100%'} p={'md'} pr={'xs'}>
      <Stack
        h={'100%'}
        gap={0}
        bdrs={'lg'}
        bd={'1px solid var(--mantine-color-default-border)'}
        style={{
          overflow: 'hidden'
        }}
      >
        <Group gap={'xs'} py={'xs'} px={'sm'} wrap={'nowrap'}>
          <img src={favicon} width={20} alt={'OpenSpace Logo'} />
          <Text size={'xs'} fw={700}>
            {t('interface-name')}
          </Text>
        </Group>
        <Divider />
        <GlobalMenuBar />
        <Divider />
        <Stack gap={'xxs'} p={'xs'} py={'xs'}>
          <ConnectionStatusIndicator />
          <Group gap={'xs'} wrap={'nowrap'}>
            <Text size={'xs'} fw={700}>
              {t('show-name')}
            </Text>
            <Text size={'sm'} c={'dimmed'}>
              {showName}
            </Text>
          </Group>
        </Stack>
        <Divider />
        <Stack p={'xs'}>
          <Undo />
        </Stack>
        <Divider />
        <ScrollArea
          type={'always'}
          flex={1}
          mih={0}
          style={{ containerType: 'inline-size', containerName: 'palette' }}
        >
          <Stack gap={'xs'} p={'xs'} py={'xs'}>
            <Text size={'xs'} fw={700}>
              {t('layout')}
            </Text>
            <LayoutToolbar />
            <Divider />
            <Text size={'xs'} fw={700}>
              {t('static-components')}
            </Text>
            <SimpleGrid cols={2} className={classes.paletteGrid}>
              {staticComponentTypes.map((v) => (
                <Button
                  key={v.type}
                  size={'sm'}
                  justify={'space-between'}
                  leftSection={v.renderIcon()}
                  style={{ containerType: 'inline-size' }}
                  onClick={() => onAddComponent(v.type)}
                >
                  <span className={classes.componentButtonLabel}>{t(v.nameKey)}</span>
                </Button>
              ))}
            </SimpleGrid>
            <Text size={'xs'} fw={700}>
              {t('preset-components')}
            </Text>
            <SimpleGrid cols={2} className={classes.paletteGrid}>
              {presetComponentTypes.map((v) => (
                <Button
                  key={v.type}
                  size={'sm'}
                  variant={'light'}
                  justify={'space-between'}
                  leftSection={v.renderIcon()}
                  style={{ containerType: 'inline-size' }}
                  onClick={() => onAddComponent(v.type)}
                >
                  <span className={classes.componentButtonLabel}>{t(v.nameKey)}</span>
                </Button>
              ))}
            </SimpleGrid>
            <Text size={'xs'} fw={700}>
              {t('property-components')}
            </Text>
            <SimpleGrid cols={2} className={classes.paletteGrid}>
              {propertyComponentTypes.map((v) => (
                <Button
                  key={v.type}
                  size={'sm'}
                  variant={'filled'}
                  justify={'space-between'}
                  leftSection={v.renderIcon()}
                  style={{ containerType: 'inline-size' }}
                  onClick={() => onAddComponent(v.type)}
                >
                  <span className={classes.componentButtonLabel}>{t(v.nameKey)}</span>
                </Button>
              ))}
            </SimpleGrid>
          </Stack>
        </ScrollArea>
        <Divider />
        <Box p={'sm'}>
          <NavigationInfo />
        </Box>
      </Stack>
    </Box>
  );
}
