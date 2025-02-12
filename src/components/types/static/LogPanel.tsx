import { Label } from '@/components/ui/label';
import {
  ConnectionState,
  useOpenSpaceApiStore,
  usePropertyStore,
} from '@/store';
import { useEffect } from 'react';

const LogPanel = () => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );

  useEffect(() => {
    return;
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('errorLog');
    return () => {
      unsubscribeFromTopic('errorLog');
    };
  }, [connectionState]);

  return (
    <div className="z-9 absolute left-0 mt-2 flex w-full flex-col items-center justify-center gap-4">
      <div className="flex w-full flex-col gap-2 px-4">
        <Label className="flex w-full justify-start">Error Logs</Label>
      </div>
    </div>
  );
};

export default LogPanel;
