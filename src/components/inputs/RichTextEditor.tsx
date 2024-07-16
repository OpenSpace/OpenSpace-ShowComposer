// import React from 'react';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css'; // Import quill styles

// interface RichTextEditorProps {
//   content: string;
//   setContent: (content: string) => void;
// }

// const RichTextEditor: React.FC<RichTextEditorProps> = ({
//   content,
//   setContent,
// }) => {
//   return (
//     <div className="p-4">
//       <ReactQuill
//         theme="snow"
//         value={content}
//         onChange={setContent}
//         className="mb-4"
//       />
//       {/* <button
//         onClick={handleSave}
//         className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
//       >
//         Save
//       </button> */}
//     </div>
//   );
// };

// export default RichTextEditor;

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
      // Debounce function to limit content updates
      const debouncedSetContent = debounce((html: string) => {
        setContent(html);
      }, 400); // Adjust debounce time as needed

      quillRef.current.on('text-change', () => {
        const currentHtml = quillRef.current?.root.innerHTML;
        if (currentHtml !== undefined && currentHtml !== content) {
          debouncedSetContent(currentHtml);
        }
      });
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
      <div ref={editorRef} style={{ height: 200, width: 600 }} />
    </div>
  );
};

export default RichTextEditor;
