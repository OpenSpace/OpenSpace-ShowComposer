import { useMemo } from 'react';

import { Clock, Telescope } from 'lucide-react';

import { Label } from '@/components/ui/label';
import ButtonLabel from './common/ButtonLabel';
// import { useComponentStore } from '@/store';
import { usePropertyStore } from '@/store';
import { NavigationAnchorKey } from '@/store/apiStore';
import { formatDate } from '@/utils/time';
const FeedbackPanel: React.FC = () => {
  const CurrentAnchor = usePropertyStore(
    (state) => state.properties[NavigationAnchorKey],
  );
  const time = usePropertyStore(
    (state) => state.properties['time']?.['timeCapped'],
  );
  //   const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  //   const subscribeToProperty = usePropertyStore(
  //     (state) => state.subscribeToProperty,
  //   );
  //   const unsubscribeFromTopic = usePropertyStore(
  //     (state) => state.unsubscribeFromTopic,
  //   );
  //   const unsubscribeFromProperty = usePropertyStore(
  //     (state) => state.unsubscribeFromProperty,
  //   );

  //   useEffect(() => {
  //     if (connectionState != ConnectionState.CONNECTED) return;
  //     subscribeToTopic('time', 1000);
  //     return () => {
  //       unsubscribeFromTopic('time');
  //     };
  //   }, [connectionState]);

  const timeLabel = useMemo(() => {
    if (time) {
      try {
        return formatDate(time);
      } catch {
        return time;
      }
    }
    return time;
  }, [time]);

  return (
    <div className="p-4">
      <div className="grid-rows grid gap-2">
        <div className={`grid  gap-2 ${time ? 'opacity-100' : 'opacity-50'}`}>
          <Label className="flex items-center justify-start gap-2">
            <Clock size={14} /> Current Time
          </Label>
          <ButtonLabel className="border bg-transparent">
            {timeLabel}
          </ButtonLabel>
        </div>
        <div />
        <div
          className={`grid gap-2 ${
            CurrentAnchor ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <Label className="flex items-center justify-start gap-2">
            <Telescope size={14} />
            Current Focus
          </Label>
          <ButtonLabel className="border bg-transparent">
            {CurrentAnchor?.value}
          </ButtonLabel>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;
