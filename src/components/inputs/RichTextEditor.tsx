import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles
import { debounce } from 'lodash'; // Assuming lodash is available
import { useTheme } from '../ThemeProvider';
import TooltipHolder from '../common/TooltipHolder';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
interface RichTextEditorProps {
  content: string;
  setContent: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  setContent,
}) => {
  const { theme } = useTheme();

  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editor div
  const quillRef = useRef<Quill | null>(null); // Reference to the Quill instance
  const [currentHeader, setCurrentHeader] = useState<number | boolean>(false);
  const [currentSize, setCurrentSize] = useState<string | boolean>('normal');

  const handleHeaderChange = (value: number | false) => {
    if (quillRef.current) {
      quillRef.current.format('header', value);
      setCurrentHeader(value);
      setTimeout(() => focusEditor(), 100);
    }
  };
  const handleSizeChange = (value: string | false) => {
    if (quillRef.current) {
      quillRef.current.format('size', value);
      setCurrentSize(value);
      setTimeout(() => focusEditor(), 100);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          // toolbar:
          toolbar: { container: '#toolbar' },
          // [
          //   // [{ header: [1, 2, false] }],
          //   [{ header: [1, 2, 3, false] }],

          //   // ['bold', 'italic', 'underline'],
          //   // ['image', 'code-block'],
          //   [{ size: [] }],
          //   ['bold', 'italic', 'underline', 'blockquote'],

          //   // ['link', 'image', 'video'],
          //   ['clean'],
          // ],
        },
      });
      const format = quillRef?.current?.getFormat();
      if (format) {
        if (
          'header' in format &&
          (typeof format.header === 'number' ||
            typeof format.header === 'boolean')
        )
          setCurrentHeader(format?.header || false);
        if (
          'size' in format &&
          (typeof format.size === 'string' || typeof format.size === 'boolean')
        )
          setCurrentSize(format?.size || 'normal');
      }

      quillRef.current.on(
        'text-change',
        debounce(() => {
          const html =
            editorRef.current?.querySelector('.ql-editor')?.innerHTML;
          setContent(html || '');
        }, 400),
      );
      quillRef.current.on('selection-change', () => {
        const format = quillRef?.current?.getFormat();
        if (format) {
          if (
            'header' in format &&
            (typeof format.header === 'number' ||
              typeof format.header === 'boolean')
          )
            setCurrentHeader(format?.header || false);
          if (
            'size' in format &&
            (typeof format.size === 'string' ||
              typeof format.size === 'boolean')
          )
            setCurrentSize(format?.size || 'normal');
        }
      });
    }

    return () => {
      quillRef.current = null;
    };
  }, []);

  const focusEditor = () => {
    if (quillRef.current) {
      // const length = quillRef.current.getLength();
      quillRef.current.focus();
      // quillRef.current.setSelection(length, length);
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.root.innerHTML = content;
    }
  }, []);

  return (
    <div className={` p-4  ${theme == 'dark' ? 'dark-mode' : ''}`}>
      <div id="toolbar">
        <span className="ql-formats">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  'flex !w-auto',
                  currentHeader === false && 'text-gray-500',
                )}
                size={'lg'}
                variant={'ghost'}
              >
                {currentHeader
                  ? currentHeader == -1
                    ? 'Header'
                    : `Header ${currentHeader}`
                  : 'Normal'}
              </Button>
              {/* </TooltipHolder> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
              <DropdownMenuCheckboxItem
                checked={currentHeader === 1}
                onSelect={() => handleHeaderChange(1)}
              >
                Header 1
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentHeader === 2}
                onSelect={() => handleHeaderChange(2)}
              >
                Header 2
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentHeader === 3}
                onSelect={() => handleHeaderChange(3)}
              >
                Header 3
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentHeader === false}
                onSelect={() => handleHeaderChange(false)}
              >
                Normal
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex !w-auto" size={'lg'} variant={'ghost'}>
                {typeof currentSize === 'string'
                  ? currentSize.charAt(0).toUpperCase() + currentSize.slice(1)
                  : ''}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
              <DropdownMenuCheckboxItem
                checked={currentSize === 'small'}
                onSelect={() => handleSizeChange('small')}
              >
                Small
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentSize === 'normal'}
                onSelect={() => handleSizeChange('normal')}
              >
                Normal
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentSize === 'large'}
                onSelect={() => handleSizeChange('large')}
              >
                Large
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentSize === 'huge'}
                onSelect={() => handleSizeChange('huge')}
              >
                Huge
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
        <span className="ql-formats">
          <TooltipHolder content="Bold">
            <button className="ql-bold"></button>
          </TooltipHolder>
          <TooltipHolder content="Italic">
            <button className="ql-italic"></button>
          </TooltipHolder>
          <TooltipHolder content="Underline">
            <button className="ql-underline"></button>
          </TooltipHolder>
        </span>
        <span className="ql-formats">
          <TooltipHolder content="Clear Formatting">
            <button className="ql-clean"></button>
          </TooltipHolder>
        </span>
      </div>
      <div
        // className={`editor-container`}
        ref={editorRef}
        style={{ height: 200, width: 'auto' }}
      />
    </div>
  );
};

export default RichTextEditor;
