import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles
import { debounce } from 'lodash'; // Assuming lodash is available

interface RichTextEditorProps {
  content: string;
  setContent: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  setContent,
}) => {
  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editor div
  const quillRef = useRef<Quill | null>(null); // Reference to the Quill instance

  useEffect(() => {
    if (editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block'],
          ],
        },
      });

      quillRef.current.on(
        'text-change',
        debounce(() => {
          const html =
            editorRef.current?.querySelector('.ql-editor')?.innerHTML;
          console.log(html);
          setContent(html || '');
        }, 400),
      );
    }

    return () => {
      quillRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.root.innerHTML = content;
    }
  }, []);

  return (
    <div className=" p-4">
      <div ref={editorRef} style={{ height: 200, width: 'auto' }} />
    </div>
  );
};

export default RichTextEditor;
