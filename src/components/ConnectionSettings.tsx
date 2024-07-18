import React, { ReactElement, useState, useEffect, cloneElement } from 'react';

import { useSettingsStore, useOpenSpaceApiStore } from '@/store'; // Adjust the import path accordingly
import { ConnectionState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { CheckCircle, XCircle, HelpCircle, Radio } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ConnectionSettingsProps {
  triggerButton?: ReactElement;
}

const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({
  triggerButton,
}) => {
  const initialState = useSettingsStore((state) => ({
    url: state.url,
    port: state.port,
  }));
  const enhancedTriggerButton = triggerButton
    ? cloneElement(triggerButton, {
        onClick: (...args: any[]) => {
          setOpen(true); // Open the dialog
          // If the triggerButton had its own onClick handler, call it
          if (triggerButton.props.onClick) {
            triggerButton.props.onClick(...args);
          }
        },
      })
    : null;
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

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>{enhancedTriggerButton}</PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent className="bg-white">
          OpenSpace Connection Settings{' '}
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Openspace Connection</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Set the IP address and port of the OpenSpace instance you want to
              connect to.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="IP">IP Address</Label>
              <Input
                id="IP"
                // defaultValue=""
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
  );
};

const ConnectionStatus = () => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  function renderConnectionState(size: number) {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return (
          <div className="flex items-center gap-1">
            <CheckCircle size={size} stroke="green" strokeWidth={2} />
            <Label className="text-xs">connected</Label>
          </div>
        );
      case ConnectionState.CONNECTING:
        return (
          <div className="flex items-center gap-1">
            <Radio
              size={size}
              className="animate-pulse"
              stroke="orange"
              strokeWidth={2}
            />
            <Label className="animate-pulse text-xs">connecting</Label>
          </div>
        );
      case ConnectionState.UNCONNECTED:
        return (
          <div className="flex items-center gap-1">
            <XCircle size={size} stroke="red" strokeWidth={2} />{' '}
            {/* <Label className="text-xs">disconnected</Label> */}
          </div>
        );
      default:
        return <HelpCircle size={size} color="black" />;
    }
  }
  return (
    <div className="flex flex-row items-center gap-3">
      <Label>OpenSpace Status:</Label>
      {renderConnectionState(20)}
    </div>
  );
};

export { ConnectionSettings, ConnectionStatus };
