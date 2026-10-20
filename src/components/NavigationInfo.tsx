import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Group, InputLabel, SimpleGrid, Stack, Text } from '@mantine/core';

import { DisplayLabel } from '@/components/DisplayLabel';
import { useProperty } from '@/hooks/properties';
import { useSubscribeToCamera, useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { ArrowUpFromDotIcon, ClockIcon, GlobeIcon, TelescopeIcon } from '@/icons/icons';
import { NavigationAnchorKey } from '@/store/apiStore';
import { IconSize } from '@/types/enums';
import { formatDate } from '@/utils/time';

interface Props {
  className?: string;
}

export function NavigationInfo({ className }: Props) {
  const { t } = useTranslation('navigation-info');
  const [currentAnchor] = useProperty('StringProperty', NavigationAnchorKey);
  const { timeCapped: time } = useSubscribeToTime(1000);
  const camera = useSubscribeToCamera(500);

  const timeLabel = useMemo(() => {
    if (time) {
      try {
        return formatDate(new Date(time));
      } catch {
        return time;
      }
    }
    return time;
  }, [time]);

  return (
    <Box className={className}>
      <Stack gap={'xs'}>
        <Stack gap={'xs'}>
          <InputLabel>
            <Group gap={'xs'} wrap={'nowrap'}>
              <ClockIcon size={IconSize.xs} />
              <Text inherit>{t('current-time')}</Text>
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>
            <Text inherit>{timeLabel || '-'}</Text>
          </DisplayLabel>
        </Stack>
        <Stack gap={'xs'}>
          <InputLabel>
            <Group gap={'xs'} wrap={'nowrap'}>
              <TelescopeIcon size={IconSize.xs} />
              <Text inherit>{t('current-focus')}</Text>
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>
            <Text inherit>{currentAnchor || '-'}</Text>
          </DisplayLabel>
        </Stack>
        <SimpleGrid cols={3} spacing={'xs'} mt={'xs'}>
          <Stack gap={'xs'}>
            <InputLabel>
              <Group gap={'xs'} wrap={'nowrap'}>
                <GlobeIcon size={IconSize.xs} />
                <Text inherit>{t('lat')}</Text>
              </Group>
            </InputLabel>
            <DisplayLabel showBorder size={'sm'}>
              <Text inherit>
                {camera?.latitude != null ? Math.round(camera.latitude * 100) / 100 : '-'}
                {t('degrees')}
              </Text>
            </DisplayLabel>
          </Stack>
          <Stack gap={'xs'}>
            <InputLabel>
              <Group gap={'xs'} wrap={'nowrap'}>
                <GlobeIcon size={IconSize.xs} />
                <Text inherit>{t('long')}</Text>
              </Group>
            </InputLabel>
            <DisplayLabel showBorder size={'sm'}>
              <Text inherit>
                {camera?.longitude != null
                  ? Math.round(camera.longitude * 100) / 100
                  : '-'}
                {t('degrees')}
              </Text>
            </DisplayLabel>
          </Stack>
          <Stack gap={'xs'}>
            <InputLabel>
              <Group gap={'xs'} wrap={'nowrap'}>
                <ArrowUpFromDotIcon size={IconSize.xs} />
                <Text inherit>{t('alt')}</Text>
              </Group>
            </InputLabel>
            <DisplayLabel showBorder size={'sm'}>
              <Text inherit>
                {camera?.altitude != null ? Math.round(camera.altitude) : '-'}{' '}
                {camera?.altitudeUnit || ''}
              </Text>
            </DisplayLabel>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}
