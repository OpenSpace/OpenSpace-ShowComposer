import { useMemo } from 'react';
import { InputLabel } from '@mantine/core';
import { ArrowUpFromDot, Clock, Globe, Telescope } from 'lucide-react';

import { useProperty } from '@/hooks/properties';
import { useSubscribeToCamera, useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { cn } from '@/lib/utils';
import { NavigationAnchorKey } from '@/store/apiStore';
import { formatDate } from '@/utils/time';

import ButtonLabel from './common/ButtonLabel';

type FeedbackPanelProps = {
  className?: string;
};

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ className = '' }) => {
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
    <div className={className}>
      <div className={'grid-rows grid gap-2'}>
        <div
          className={cn('grid gap-2', {
            'opacity-100': time,
            'opacity-50': !time
          })}
        >
          <InputLabel className={'flex items-center justify-start gap-2'}>
            <Clock size={14} /> Current Time
          </InputLabel>
          <ButtonLabel className={'border bg-transparent'}>{timeLabel}</ButtonLabel>
        </div>
        <div />
        <div
          className={cn('grid gap-2', {
            'opacity-100': currentAnchor,
            'opacity-50': !currentAnchor
          })}
        >
          <InputLabel className={'flex items-center justify-start gap-2'}>
            <Telescope size={14} />
            Current Focus
          </InputLabel>
          <ButtonLabel className={'border bg-transparent'}>{currentAnchor}</ButtonLabel>
        </div>
        {camera && (
          <div className={'mt-2 grid grid-cols-3 gap-2'}>
            <div className={'flex flex-col gap-2'}>
              <InputLabel className={'flex items-center justify-start gap-2'}>
                <Globe size={14} />
                Lat
              </InputLabel>
              <ButtonLabel
                resize={false}
                className={'border bg-transparent px-2 text-xs'}
              >
                {camera?.latitude ? Math.round(camera.latitude * 100) / 100 : '-'}&deg;
              </ButtonLabel>
            </div>
            <div className={'flex flex-col gap-2'}>
              <InputLabel className={'flex items-center justify-start gap-2'}>
                <Globe size={14} />
                Long
              </InputLabel>
              <ButtonLabel
                resize={false}
                className={'border bg-transparent px-2 text-xs'}
              >
                {camera?.longitude ? Math.round(camera.longitude * 100) / 100 : '-'}&deg;
              </ButtonLabel>
            </div>
            <div className={'flex flex-col gap-2'}>
              <InputLabel className={'flex items-center justify-start gap-2'}>
                <ArrowUpFromDot size={14} />
                Alt
              </InputLabel>
              <ButtonLabel
                resize={false}
                className={'text-nowrap border bg-transparent px-2 text-xs'}
              >
                {camera?.altitude ? Math.round(camera.altitude * 1) / 1 : '-'}{' '}
                {camera?.altitudeUnit || ''}
              </ButtonLabel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;
