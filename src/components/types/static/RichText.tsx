import RichTextEditor from '@/components/inputs/RichTextEditor';
import { RichTextComponent } from '@/store';
import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';

interface RichTextGUIProps {
  component: RichTextComponent;
}

const RichTextGUIComponent: React.FC<RichTextGUIProps> = ({ component }) => {
  return (
    <div className=" absolute right-0 top-0 flex h-full w-full items-center justify-center ">
      <div className="ql-snow">
        <div
          className=" ql-editor prose-sm z-[99] h-full w-full p-4 prose-headings:my-0 prose-p:my-0 dark:text-slate-200"
          dangerouslySetInnerHTML={{ __html: component.text }}
        />
      </div>
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
  const [height, setHeight] = useState(component?.height || 100);
  const [width, setWidth] = useState(component?.width || 100);

  const measureAndUpdateSize = (text: string) => {
    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.width = 'auto';
    measureDiv.style.height = 'auto';
    measureDiv.className =
      'prose-sm p-6 prose-headings:my-0 prose-p:my-0 !max-w-[600px] m-auto';
    document.body.appendChild(measureDiv);

    measureDiv.innerHTML = text;

    const { width, height } = measureDiv.getBoundingClientRect();
    setWidth(Math.max(width, 100));
    setHeight(Math.max(height, 100));
    document.body.removeChild(measureDiv);
  };

  const debouncedMeasureAndUpdateSize = debounce(measureAndUpdateSize, 500);

  useEffect(() => {
    debouncedMeasureAndUpdateSize(text);
    return () => debouncedMeasureAndUpdateSize.cancel();
  }, [text]);

  useEffect(() => {
    handleComponentData({ text, width, height });
  }, [text, width, height, handleComponentData]);

  return (
    <>
      <div className="mb-4">
        <RichTextEditor content={text} setContent={setText} />
      </div>
    </>
  );
};

export { RichTextModal, RichTextGUIComponent };
