import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';

import { cn } from '@/lib/utils';

import TooltipHolder from '../common/TooltipHolder';
// import { debounce } from 'lodash'; // Assuming lodash is available
import { useTheme } from '../ThemeProvider';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';

import 'quill/dist/quill.snow.css'; // Import Quill styles
interface RichTextEditorProps {
  content: string;
  setContent: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, setContent }) => {
  const { theme } = useTheme();

  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editor div
  const quillRef = useRef<Quill | null>(null); // Reference to the Quill instance
  const [currentHeader, setCurrentHeader] = useState<number | boolean>(false);
  const [currentSize, setCurrentSize] = useState<string | boolean>('normal');
  const [shouldFocus, setShouldFocus] = useState<boolean>(true); // Flag to control focus

  const handleHeaderChange = (value: number | false) => {
    if (quillRef.current) {
      quillRef.current.format('header', value);
      setCurrentHeader(value);
      // setShouldFocus(true);
      setTimeout(() => focusEditor(), 100);
    }
  };
  const handleSizeChange = (value: string | false) => {
    if (quillRef.current) {
      quillRef.current.format('size', value);
      setCurrentSize(value);
      // setShouldFocus(true);
      setTimeout(() => focusEditor(), 100);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
      // Prevent Quill from focusing
      quillRef.current?.blur();
      setShouldFocus(false); // Set flag to false on blur
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: { container: '#toolbar' }
        }
      });
      const format = quillRef?.current?.getFormat();
      if (format) {
        if (
          'header' in format &&
          (typeof format.header === 'number' || typeof format.header === 'boolean')
        )
          setCurrentHeader(format?.header || false);
        if (
          'size' in format &&
          (typeof format.size === 'string' || typeof format.size === 'boolean')
        )
          setCurrentSize(format?.size || 'normal');
      }

      quillRef.current.on('text-change', () => {
        const html = editorRef.current?.querySelector('.ql-editor')?.innerHTML;
        setContent(html || '');
      });

      // Add event listener for clicks outside the editor
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      quillRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (shouldFocus && quillRef.current) {
      quillRef.current.focus(); // Focus only if the flag is true
    }
  }, [shouldFocus]);

  const focusEditor = () => {
    if (quillRef.current) {
      quillRef.current.focus();
      setShouldFocus(true); // Allow focus again
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.root.innerHTML = content;

      // quillRef.current.root.blur();
      // quillRef.current.blur();
    }
  }, []);

  return (
    <div className={` p-4  ${theme == 'dark' ? 'dark-mode' : ''}`}>
      <div id={'toolbar'}>
        <span className={'ql-formats'}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn('flex !w-auto', currentHeader === false && 'text-gray-500')}
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
              <Button className={'flex !w-auto'} size={'lg'} variant={'ghost'}>
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
        <span className={'ql-formats'}>
          <TooltipHolder content={'Bold'}>
            <button className={'ql-bold'}></button>
          </TooltipHolder>
          <TooltipHolder content={'Italic'}>
            <button className={'ql-italic'}></button>
          </TooltipHolder>
          <TooltipHolder content={'Underline'}>
            <button className={'ql-underline'}></button>
          </TooltipHolder>
        </span>
        <span className={'ql-formats'}>
          <TooltipHolder content={'Clear Formatting'}>
            <button className={'ql-clean'}></button>
          </TooltipHolder>
        </span>
      </div>
      <div
        // className={`editor-container`}
        ref={editorRef}
        style={{ height: 200, width: 'auto' }}
        onClick={focusEditor} // Focus on click
      />
    </div>
  );
};

export default RichTextEditor;
