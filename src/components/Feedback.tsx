import { useMemo } from 'react';
import { Box, Group, InputLabel, SimpleGrid, Stack } from '@mantine/core';

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

export function Feedback({ className }: Props) {
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
              <ClockIcon size={IconSize.xs} /> Current Time
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>{timeLabel || '-'}</DisplayLabel>
        </Stack>
        <Stack gap={'xs'}>
          <InputLabel>
            <Group gap={'xs'} wrap={'nowrap'}>
              <TelescopeIcon size={IconSize.xs} />
              Current Focus
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>{currentAnchor || '-'}</DisplayLabel>
        </Stack>
        <SimpleGrid cols={3} spacing={'xs'} mt={'xs'}>
          <Stack gap={'xs'}>
            <InputLabel>
              <Group gap={'xs'} wrap={'nowrap'}>
                <GlobeIcon size={IconSize.xs} />
                Lat
              </Group>
            </InputLabel>
            <DisplayLabel showBorder size={'sm'}>
              {camera?.latitude != null ? Math.round(camera.latitude * 100) / 100 : '-'}
              &deg;
            </DisplayLabel>
          </Stack>
          <Stack gap={'xs'}>
            <InputLabel>
              <Group gap={'xs'} wrap={'nowrap'}>
                <GlobeIcon size={IconSize.xs} />
                Long
              </Group>
            </InputLabel>
            <DisplayLabel showBorder size={'sm'}>
              {camera?.longitude != null ? Math.round(camera.longitude * 100) / 100 : '-'}
              &deg;
            </DisplayLabel>
          </Stack>
          <Stack gap={'xs'}>
            <InputLabel>
              <Group gap={'xs'} wrap={'nowrap'}>
                <ArrowUpFromDotIcon size={IconSize.xs} />
                Alt
              </Group>
            </InputLabel>
            <DisplayLabel showBorder size={'sm'}>
              {camera?.altitude != null ? Math.round(camera.altitude) : '-'}{' '}
              {camera?.altitudeUnit || ''}
            </DisplayLabel>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}
