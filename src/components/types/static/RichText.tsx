import RichTextEditor from '@/components/inputs/RichTextEditor';
import { RichTextComponent } from '@/store';
import React, { useEffect, useState, useRef } from 'react';

interface RichTextGUIProps {
  component: RichTextComponent;
}

const RichTextGUIComponent: React.FC<RichTextGUIProps> = ({ component }) => {
  return (
    <div className="yarn absolute right-0 top-0 flex h-full w-full items-center justify-center ">
      <div dangerouslySetInnerHTML={{ __html: component.text }} />
      {/* <RichTextEditor content={} saveContent /> */}
    </div>
  );
};
interface RichTextModalProps {
  component: RichTextComponent | null;
  handleComponentData: (data: Partial<RichTextComponent>) => void;
  //   isOpen: boolean;
}

const RichTextModal: React.FC<RichTextModalProps> = ({
  component,
  handleComponentData,
  //   isOpen,
}) => {
  const [text, setText] = useState(component?.text || '');

  useEffect(() => {
    handleComponentData({ text });
  }, [text, handleComponentData]);

  return (
    <>
      <div className="mb-4">
        <RichTextEditor content={text} setContent={setText} />
      </div>
    </>
  );
};

export { RichTextModal, RichTextGUIComponent };
