import { useEffect, useMemo } from 'react';
import { ArrowUpFromDot, Clock, Globe, Telescope } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
// import { useComponentStore } from '@/store';
import { ConnectionState, usePropertyStore } from '@/store';
import { NavigationAnchorKey, useOpenSpaceApiStore } from '@/store/apiStore';
import { formatDate } from '@/utils/time';

import ButtonLabel from './common/ButtonLabel';

type FeedbackPanelProps = {
  className?: string;
};

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ className = '' }) => {
  const CurrentAnchor = usePropertyStore(
    (state) => state.properties[NavigationAnchorKey]
  );
  const time = usePropertyStore((state) => state.time?.['timeCapped']);
  const camera = usePropertyStore((state) => state.camera);
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const subscribeToProperty = usePropertyStore((state) => state.subscribeToProperty);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty
  );

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    subscribeToTopic('camera', 500);
    subscribeToProperty(NavigationAnchorKey, 1000);
    subscribeToTopic('time', 1000);

    return () => {
      unsubscribeFromTopic('camera');
      unsubscribeFromTopic('time');
      unsubscribeFromProperty(NavigationAnchorKey);
    };
  }, [connectionState]);

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
          <Label className={'flex items-center justify-start gap-2'}>
            <Clock size={14} /> Current Time
          </Label>
          <ButtonLabel className={'border bg-transparent'}>{timeLabel}</ButtonLabel>
        </div>
        <div />
        <div
          className={cn('grid gap-2', {
            'opacity-100': CurrentAnchor,
            'opacity-50': !CurrentAnchor
          })}
        >
          <Label className={'flex items-center justify-start gap-2'}>
            <Telescope size={14} />
            Current Focus
          </Label>
          <ButtonLabel className={'border bg-transparent'}>
            {CurrentAnchor?.value}
          </ButtonLabel>
        </div>
        {camera && (
          <div className={'mt-2 grid grid-cols-3 gap-2'}>
            <div className={'flex flex-col gap-2'}>
              <Label className={'flex items-center justify-start gap-2'}>
                <Globe size={14} />
                Lat
              </Label>
              <ButtonLabel
                resize={false}
                className={'border bg-transparent px-2 text-xs'}
              >
                {camera?.latitude ? Math.round(camera.latitude * 100) / 100 : '-'}&deg;
              </ButtonLabel>
            </div>
            <div className={'flex flex-col gap-2'}>
              <Label className={'flex items-center justify-start gap-2'}>
                <Globe size={14} />
                Long
              </Label>
              <ButtonLabel
                resize={false}
                className={'border bg-transparent px-2 text-xs'}
              >
                {camera?.longitude ? Math.round(camera.longitude * 100) / 100 : '-'}&deg;
              </ButtonLabel>
            </div>
            <div className={'flex flex-col gap-2'}>
              <Label className={'flex items-center justify-start gap-2'}>
                <ArrowUpFromDot size={14} />
                Alt
              </Label>
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
