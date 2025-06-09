import { Fragment } from 'react';
import { useState } from 'react';
import { AudioWaveform } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePropertyStore } from '@/store'; // Adjust the import path accordingly
import { getCopy } from '@/utils/copyHelpers';

import { Button } from './ui/button';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
const SubscriptionPanel = () => {
  const topics = usePropertyStore((state) => state.topicSubscriptions);
  const subscriptions = usePropertyStore((state) => state.propertySubscriptions);
  const [open, setOpen] = useState<boolean>(false);
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  // const unsubscribeFromTopic = usePropertyStore(
  //   (state) => state.unsubscribeFromTopic,
  // );
  // const unsubscribeFromProperty = usePropertyStore(
  //   (state) => state.unsubscribeFromProperty,
  // );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <div className={'mt-0 flex flex-row items-center justify-start px-4 pb-4'}>
              <Button className={'w-auto gap-2'} variant={'outline'} size={'sm'}>
                <AudioWaveform size={16} />{' '}
                <Label>{getCopy('SubscriptionPanel', 'active_subscriptions')}</Label>
              </Button>
            </div>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent className={'bg-white'}>
          {getCopy('SubscriptionPanel', 'active_property_subscriptions')}
        </TooltipContent>
      </Tooltip>

      <PopoverContent className={'w-auto'}>
        <div className={'m-4 rounded-md border border-gray-300 p-4'}>
          <h2 className={'mb-2 font-bold'}>
            {getCopy('SubscriptionPanel', 'active_subscriptions')}
          </h2>
          {Object.keys(topics).length > 0 || Object.keys(subscriptions).length > 0 ? (
            <div className={'flex flex-col justify-center gap-2'}>
              <>
                {Object.entries(topics).map(([topicName, { count }]) => (
                  <Fragment key={topicName}>
                    <Separator key={topicName} />
                    <div key={topicName} className={'grid grid-cols-4 gap-2'}>
                      <Label className={'col-span-3 '}>{topicName} </Label>
                      <div className={'flex flex-row justify-end gap-2'}>
                        <Label>{getCopy('SubscriptionPanel', 'subscribers:')}</Label>
                        <Label>{count}</Label>
                      </div>
                    </div>
                  </Fragment>
                ))}
                {Object.entries(subscriptions).map(([topicName, { count }]) => (
                  <Fragment key={topicName}>
                    <Separator key={topicName} />
                    <div key={topicName} className={'grid grid-cols-4 gap-2'}>
                      <Label className={'col-span-3 '}>{topicName} </Label>
                      <div className={'flex flex-row justify-end gap-2'}>
                        <Label>{getCopy('SubscriptionPanel', 'subscribers:')}</Label>
                        <Label>{count}</Label>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </>
            </div>
          ) : (
            <p>{getCopy('SubscriptionPanel', 'no_active_subscriptions.')}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default SubscriptionPanel;
