import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';

import ColorPickerComponent from '@/components/common/ColorPickerComponent';
import RichTextEditor from '@/components/inputs/RichTextEditor';
import { Label } from '@/components/ui/label';
import { RichTextComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/store/ComponentTypes';

interface RichTextGUIProps {
  component: RichTextComponent;
}

const RichTextGUIComponent: React.FC<RichTextGUIProps> = ({ component }) => {
  const position = useBoundStore((state) => state.positions[component?.id || '']);
  const updatePosition = useBoundStore((state) => state.updatePosition);
  // const [text, setText] = useState(component?.text || '');
  const [height, setHeight] = useState(position?.height || 100);
  const [width, setWidth] = useState(position?.width || 100);

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
  const debouncedMeasureAndUpdateSize = debounce(measureAndUpdateSize, 100);
  useEffect(() => {
    debouncedMeasureAndUpdateSize(component.text);
    return () => debouncedMeasureAndUpdateSize.cancel();
  }, [component.text]);

  useEffect(() => {
    updatePosition(component.id, {
      height,
      width
    });
  }, [height, width]);
  return (
    <div
      className={
        ' absolute right-0 top-0 flex h-full w-full items-center justify-center '
      }
      style={{
        backgroundColor: component.color
      }}
    >
      <div className={'ql-snow'}>
        <div
          className={
            ' ql-editor prose-sm z-[99] h-full w-full p-4 prose-headings:my-0 prose-p:my-0 dark:text-slate-200'
          }
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
  handleComponentData
  //   isOpen,
}) => {
  const [text, setText] = useState(component?.text || '');
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.richtext
  );
  useEffect(() => {
    handleComponentData({ text, color });
  }, [text, color, handleComponentData]);
  return (
    <>
      <div className={'grid-span-3 grid gap-2'}>
        <Label htmlFor={'description'}>Background Color</Label>
        <div className={'z-99 2 flex flex-row items-center justify-center'}>
          <ColorPickerComponent color={color} setColor={setColor} />
        </div>
      </div>
      <div className={'grid-span-1 grid gap-2'}>
        <RichTextEditor content={text} setContent={setText} />
      </div>
    </>
  );
};

export { RichTextGUIComponent, RichTextModal };
