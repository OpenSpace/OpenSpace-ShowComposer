import { useEffect, useState } from 'react';
import { useSettingsStore, useOpenSpaceApiStore } from '@/store'; // Adjust the import path accordingly
import { ConnectionState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaQuestionCircle,
} from 'react-icons/fa';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const ConnectionSettings = () => {
  const initialState = useSettingsStore((state) => ({
    url: state.url,
    port: state.port,
  }));

  const [url, setUrl] = useState(initialState.url);
  const [port, setPort] = useState(initialState.port);
  const setConnectionSettings = useSettingsStore(
    (state) => state.setConnectionSettings,
  );

  const connect = useOpenSpaceApiStore((state) => state.connect);
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (connectionState === ConnectionState.UNCONNECTED) {
      console.log('CONNECTING');
      connect(url, parseInt(port));
    }
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPort(e.target.value);
  };

  const handleSubmit = () => {
    // e.preventDefault();
    setConnectionSettings(url, port);
    setOpen(false);
  };

  // // function to redner connection state with a red, yellow or green dot, size is settable
  // function renderConnectionState(size: number) {
  //   switch (connectionState) {
  //     case ConnectionState.CONNECTED:
  //       return <span style={{ color: 'green', fontSize: size }}>•</span>;
  //     case ConnectionState.CONNECTING:
  //       return <span style={{ color: 'yellow', fontSize: size }}>•</span>;
  //     case ConnectionState.UNCONNECTED:
  //       return <span style={{ color: 'red', fontSize: size }}>•</span>;
  //     default:
  //       return <span>•</span>;
  //   }
  // }

  // useing react-icons can we have three connectiosn statues represneted by icons

  function renderConnectionState(size: number) {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return (
          <FaCheckCircle
            size={size}
            style={{ outline: '1px solid white', borderRadius: '50%' }}
            color="green"
          />
        );
      case ConnectionState.CONNECTING:
        return <FaExclamationCircle size={size} color="yellow" />;
      case ConnectionState.UNCONNECTED:
        return <FaTimesCircle size={size} color="red" />;
      default:
        return <FaQuestionCircle size={size} color="black" />;
    }
  }

  return (
    <>
      <div className="flex flex-row items-center gap-4 ">
        <Label>Connection Status:</Label>
        {renderConnectionState(16)}
      </div>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            size={'sm'}
            variant={'outline'}
            className="w-fit"
            onClick={() => setOpen(true)}
          >
            Open OpenSpace Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Openspace Connection</h4>
              <p className="text-muted-foreground text-sm">
                Set the IP address and port of the OpenSpace instance you want
                to connect to.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="IP">IP Address</Label>
                <Input
                  id="IP"
                  defaultValue=""
                  className="col-span-2 h-8"
                  type="text"
                  // className="m-2 p-2"
                  // id="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="Enter OpenSpace URL"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  className="col-span-2 h-8"
                  type="text"
                  value={port}
                  onChange={handlePortChange}
                  placeholder="Enter OpenSpace Port"
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}> Apply Settings</Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ConnectionSettings;
