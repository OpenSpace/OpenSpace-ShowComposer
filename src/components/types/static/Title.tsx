import { TitleComponent } from '@/store';
import React, { useEffect, useState } from 'react';

interface TitleGUIProps {
  component: TitleComponent;
}

const TitleGUIComponent: React.FC<TitleGUIProps> = ({ component }) => {
  return (
    <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center">
      <h1 className="text-2xl">{component?.text}</h1>
    </div>
  );
};

interface TitleModalProps {
  component: TitleComponent | null;
  handleComponentData: (data: Partial<TitleComponent>) => void;
  isOpen: boolean;
}

const TitleModal: React.FC<TitleModalProps> = ({
  component,
  handleComponentData,
  isOpen,
}) => {
  const [text, setText] = useState(component?.text || '');

  useEffect(() => {
    handleComponentData({ text });
  }, [text, handleComponentData]);

  useEffect(() => {
    if (component) {
      setText(component?.text);
    } else {
      setText('');
    }
  }, [component, setText]);

  useEffect(() => {
    if (!isOpen) {
      setText('');
    }
  }, [isOpen, setText]);

  return (
    <>
      <div className="mb-4">
        <div className="mb-1 block">
          <label className="mb-1 block">Title</label>
          <input
            className="w-full rounded border p-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export { TitleModal, TitleGUIComponent };
