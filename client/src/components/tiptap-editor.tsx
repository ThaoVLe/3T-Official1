import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useEffect } from 'react';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        document: false,
        paragraph: false,
        text: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts here...',
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      CodeBlock,
      Image,
      Link,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // This effect safely updates the editor content when the value prop changes
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      try {
        // Only update if the content is different to avoid cursor jumping
        console.log("Updating editor content:", value);
        editor.commands.setContent(value || '');
      } catch (error) {
        console.error("Error updating editor content:", error);
      }
    }
  }, [editor, value]);

  return <EditorContent editor={editor} className="min-h-[300px] prose prose-sm sm:prose max-w-none" />;
}