import React, { cloneElement, ReactElement, useEffect, useState } from 'react';
import { CheckCircle, HelpCircle, Radio, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOpenSpaceApiStore, useSettingsStore } from '@/store'; // Adjust the import path accordingly
import { ConnectionState } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
interface ConnectionSettingsProps {
  triggerButton?: ReactElement;
}
const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ triggerButton }) => {
  const { ip: initialUrl, port: initialPort } = useSettingsStore();

  // const initialState = useMemo(() => useSettingsStore((state) => ({
  //   url: state.ip,
  //   port: state.port,
  // })), []);
  useEffect(() => {
    // console.log('initialState', initialState);
    setUrl(initialUrl);
    setPort(initialPort);
  }, [initialUrl, initialPort]);
  const enhancedTriggerButton = triggerButton
    ? cloneElement(triggerButton, {
        onClick: (...args: React.MouseEvent<HTMLElement>[]) => {
          setOpen(true); // Open the dialog
          // If the triggerButton had its own onClick handler, call it
          if (triggerButton.props.onClick) {
            triggerButton.props.onClick(...args);
          }
        }
      })
    : null;
  const [url, setUrl] = useState(initialUrl);
  const [port, setPort] = useState(initialPort);
  const setConnectionSettings = useSettingsStore((state) => state.setConnectionSettings);
  const connect = useOpenSpaceApiStore((state) => state.connect);
  const forceRefresh = useOpenSpaceApiStore((state) => state.forceRefresh);
  // const disconnect = useOpenSpaceApiStore((state) => state.disconnect);
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const [prevPort, setPrevPort] = useState<string>(port);
  const [prevUrl, setPrevUrl] = useState<string>(url);
  const [open, setOpen] = useState<boolean>(false);
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };
  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (connectionState == ConnectionState.UNCONNECTED) {
      connect();
    }
  }, [connectionState]);

  useEffect(() => {
    if (prevPort !== initialPort || prevUrl !== initialUrl) {
      forceRefresh();
      setPrevPort(initialPort);
      setPrevUrl(initialUrl);
    }
  }, [initialUrl, initialPort]);
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPort(e.target.value);
  };
  const handleSubmit = () => {
    // e.preventDefault();
    // console.log('handleSubmit', url, port);
    setConnectionSettings(url, port);
    forceRefresh();
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>{enhancedTriggerButton}</PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side={'bottom'} className={'bg-white'}>
          {getCopy('ConnectionSettings', 'openspace_connection_settings')}
        </TooltipContent>
      </Tooltip>

      <PopoverContent className={'w-80'}>
        <div className={'grid gap-4'}>
          <div className={'space-y-2'}>
            <h4 className={'font-medium leading-none'}>
              {getCopy('ConnectionSettings', 'openspace_connection')}
            </h4>
            <p className={'text-sm text-slate-500 dark:text-slate-400'}>
              {getCopy('ConnectionSettings', 'address_copy')}
            </p>
          </div>
          <div className={'grid gap-2'}>
            <div className={'grid grid-cols-3 items-center gap-4'}>
              <Label htmlFor={'IP'}>{getCopy('ConnectionSettings', 'ip_address')}</Label>
              <Input
                id={'IP'}
                // defaultValue=""
                className={'col-span-2 h-8'}
                type={'text'}
                // className="m-2 p-2"
                // id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder={'Enter OpenSpace URL'}
              />
            </div>
            <div className={'grid grid-cols-3 items-center gap-4'}>
              <Label htmlFor={'port'}>{getCopy('ConnectionSettings', 'port')}</Label>
              <Input
                id={'port'}
                className={'col-span-2 h-8'}
                type={'text'}
                value={port}
                onChange={handlePortChange}
                placeholder={'Enter OpenSpace Port'}
              />
            </div>
            <div className={'flex justify-between'}>
              <Button variant={'outline'} onClick={handleClose}>
                {getCopy('ConnectionSettings', 'cancel')}
              </Button>
              <Button onClick={handleSubmit}>
                {getCopy('ConnectionSettings', 'apply_settings')}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
const ConnectionStatus = () => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  // const connect = useOpenSpaceApiStore((state) => state.connect);

  // useEffect(() => {
  //   console.log('connectionState', connectionState);
  //   // if (connectionState === ConnectionState.UNCONNECTED) {
  //   //   connect();
  //   // }
  // }, [connectionState]);

  function renderConnectionState(size: number) {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return (
          <div className={'flex items-center gap-1'}>
            <CheckCircle size={size} stroke={'green'} strokeWidth={2} />
            <Label className={'text-xs'}>
              {getCopy('ConnectionSettings', 'connected')}
            </Label>
          </div>
        );
      case ConnectionState.CONNECTING:
        return (
          <div className={'flex items-center gap-1'}>
            <Radio
              size={size}
              className={'animate-pulse'}
              stroke={'orange'}
              strokeWidth={2}
            />
            <Label className={'animate-pulse text-xs'}>
              {getCopy('ConnectionSettings', 'connecting')}
            </Label>
          </div>
        );
      case ConnectionState.UNCONNECTED:
        return (
          <div className={'flex items-center gap-1'}>
            <XCircle size={size} stroke={'red'} strokeWidth={2} />{' '}
            <Label className={'text-xs'}>
              {getCopy('ConnectionSettings', 'disconnected')}
            </Label>
          </div>
        );
      default:
        return <HelpCircle size={size} color={'black'} />;
    }
  }
  return (
    <div className={'flex flex-row items-center gap-3'}>
      <h2 className={' text-xs font-bold'}>
        {getCopy('ConnectionSettings', 'openspace_status:')}
      </h2>
      {renderConnectionState(20)}
    </div>
  );
};

export { ConnectionSettings, ConnectionStatus };
