import { useMemo } from 'react';
import { Box, Group, InputLabel, SimpleGrid, Stack } from '@mantine/core';

import { DisplayLabel } from '@/components/DisplayLabel';
import { useProperty } from '@/hooks/properties';
import { useSubscribeToCamera, useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { ArrowUpFromDotIcon, ClockIcon, GlobeIcon, TelescopeIcon } from '@/icons/icons';
import { NavigationAnchorKey } from '@/store/apiStore';
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
        <Stack gap={'xs'} style={{ opacity: time ? 1 : 0.5 }}>
          <InputLabel>
            <Group gap={'xs'} wrap={'nowrap'}>
              <ClockIcon size={14} /> Current Time
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>{timeLabel}</DisplayLabel>
        </Stack>
        <Stack gap={'xs'} style={{ opacity: currentAnchor ? 1 : 0.5 }}>
          <InputLabel>
            <Group gap={'xs'} wrap={'nowrap'}>
              <TelescopeIcon size={14} />
              Current Focus
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>{currentAnchor}</DisplayLabel>
        </Stack>
        {camera && (
          <SimpleGrid cols={3} spacing={'xs'} mt={'xs'}>
            <Stack gap={'xs'}>
              <InputLabel>
                <Group gap={'xs'} wrap={'nowrap'}>
                  <GlobeIcon size={14} />
                  Lat
                </Group>
              </InputLabel>
              <DisplayLabel showBorder size={'sm'}>
                {camera?.latitude ? Math.round(camera.latitude * 100) / 100 : '-'}&deg;
              </DisplayLabel>
            </Stack>
            <Stack gap={'xs'}>
              <InputLabel>
                <Group gap={'xs'} wrap={'nowrap'}>
                  <GlobeIcon size={14} />
                  Long
                </Group>
              </InputLabel>
              <DisplayLabel showBorder size={'sm'}>
                {camera?.longitude ? Math.round(camera.longitude * 100) / 100 : '-'}&deg;
              </DisplayLabel>
            </Stack>
            <Stack gap={'xs'}>
              <InputLabel>
                <Group gap={'xs'} wrap={'nowrap'}>
                  <ArrowUpFromDotIcon size={14} />
                  Alt
                </Group>
              </InputLabel>
              <DisplayLabel showBorder size={'sm'}>
                {camera?.altitude ? Math.round(camera.altitude * 1) / 1 : '-'}{' '}
                {camera?.altitudeUnit || ''}
              </DisplayLabel>
            </Stack>
          </SimpleGrid>
        )}
      </Stack>
    </Box>
  );
}
