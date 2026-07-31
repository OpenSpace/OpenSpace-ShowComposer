import { Select, Tooltip } from '@mantine/core';
import { RichTextEditor as MantineRichTextEditor } from '@mantine/tiptap';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import { useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];

const BLOCK_FORMATS = [
  { value: 'paragraph', label: 'Normal' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' }
];
const HEADING_LEVELS = { h1: 1, h2: 2, h3: 3 } as const;
type HeadingKey = keyof typeof HEADING_LEVELS;

interface RichTextEditorProps {
  content: string;
  setContent: (content: string) => void;
}

// See docs here: https://mantine.dev/x/tiptap/ and here https://tiptap.dev/docs/examples/basics/default-text-editor
export function RichTextEditor({ content, setContent }: RichTextEditorProps) {
  const editor = useEditor({
    // Toolbar-only editor: no markdown input/paste conversion, and the block/mark types
    // that have no toolbar button are disabled so they can't be created at all.
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        link: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false
      }),
      TextStyle,
      FontSize
    ],
    content,
    enableInputRules: false,
    enablePasteRules: false,
    onUpdate: ({ editor }) => setContent(editor.getHTML())
  });

  const paragraphType = useEditorState({
    editor,
    selector: (snapshot) => {
      const active = snapshot.editor;
      if (active?.isActive('heading', { level: 1 })) {
        return 'h1';
      }
      if (active?.isActive('heading', { level: 2 })) {
        return 'h2';
      }
      if (active?.isActive('heading', { level: 3 })) {
        return 'h3';
      }
      return 'paragraph';
    }
  });

  const currentFontSize = useEditorState({
    editor,
    selector: (snapshot) => {
      const size = snapshot.editor?.getAttributes('textStyle').fontSize;
      return size ? parseInt(size, 10) : null;
    }
  });

  function handleParagraphTypeChange(value: string | null) {
    if (!value || !editor) {
      return;
    }
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .setHeading({ level: HEADING_LEVELS[value as HeadingKey] })
        .run();
    }
  }

  return (
    <MantineRichTextEditor editor={editor}>
      <MantineRichTextEditor.Toolbar sticky>
        <Select
          size={'xs'}
          w={120}
          aria-label={'Text format'}
          data={BLOCK_FORMATS}
          value={paragraphType ?? 'paragraph'}
          onChange={handleParagraphTypeChange}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />
        <Select
          size={'xs'}
          w={90}
          placeholder={'Size'}
          aria-label={'Font size'}
          data={FONT_SIZES.map((size) => ({ value: String(size), label: `${size} px` }))}
          value={currentFontSize ? String(currentFontSize) : null}
          onChange={(value) => {
            if (value && editor) {
              editor.chain().focus().setFontSize(`${value}px`).run();
            }
          }}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />
        <MantineRichTextEditor.ControlsGroup>
          <Tooltip label={'Bold'}>
            {/* Override the built in hover popover by setting title to empty string */}
            <MantineRichTextEditor.Bold title={''} />
          </Tooltip>
          <Tooltip label={'Italic'}>
            {/* Override the built in hover popover by setting title to empty string */}
            <MantineRichTextEditor.Italic title={''} />
          </Tooltip>
          <Tooltip label={'Underline'}>
            {/* Override the built in hover popover by setting title to empty string */}
            <MantineRichTextEditor.Underline title={''} />
          </Tooltip>
        </MantineRichTextEditor.ControlsGroup>
        <MantineRichTextEditor.ControlsGroup>
          <Tooltip label={'Clear formatting'}>
            <MantineRichTextEditor.ClearFormatting title={''} />
          </Tooltip>
        </MantineRichTextEditor.ControlsGroup>
      </MantineRichTextEditor.Toolbar>
      <MantineRichTextEditor.Content />
    </MantineRichTextEditor>
  );
}
