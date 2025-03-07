import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useEffect } from 'react';
import Placeholder from '@tiptap/extension-placeholder';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4'
          }
        },
        heading: {
          levels: [1, 2],
          HTMLAttributes: {
            class: '',
          }
        }
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-slate focus:outline-none min-h-[150px] px-0',
      }
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <EditorContent editor={editor} className="w-full" />
  );
}