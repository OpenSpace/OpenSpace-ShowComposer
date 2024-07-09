import { useEffect, useState } from 'react';
import { useSettingsStore, useOpenSpaceApiStore } from '@/store'; // Adjust the import path accordingly
import { ConnectionState } from '@/store';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionSettings(url, port);
  };

  // function to redner connection state with a red, yellow or green dot, size is settable
  function renderConnectionState(size: number) {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return <span style={{ color: 'green', fontSize: size }}>•</span>;
      case ConnectionState.CONNECTING:
        return <span style={{ color: 'yellow', fontSize: size }}>•</span>;
      case ConnectionState.UNCONNECTED:
        return <span style={{ color: 'red', fontSize: size }}>•</span>;
      default:
        return <span>•</span>;
    }
  }

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <h2 className="mt-4 text-sm font-bold text-black">
          Connection Status:
        </h2>
        {renderConnectionState(64)}
      </div>
      <form onSubmit={handleSubmit} className="gap-2 p-2 text-black">
        <div>
          <label htmlFor="url">URL:</label>
          <input
            type="text"
            className="m-2 p-2"
            id="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter OpenSpace URL"
          />
        </div>
        <div>
          <label htmlFor="port">Port:</label>
          <input
            type="text"
            className="m-2 p-2"
            id="port"
            value={port}
            onChange={handlePortChange}
            placeholder="Enter OpenSpace Port"
          />
        </div>
        <button
          className="w-auto rounded border-[1px] border-black bg-white p-2 text-black"
          type="submit"
        >
          Apply Settings
        </button>
      </form>
    </>
  );
};

export default ConnectionSettings;
