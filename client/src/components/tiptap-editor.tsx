import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Smile,
  Type,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'What are you doing today?',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[200px] prose prose-p:text-base prose-p:font-normal'
      }
    }
  });

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !editorRef.current) return;

    // Ensure minimum height and smooth expansion
    const adjustHeight = () => {
      if (!editorRef.current) return;

      const proseMirror = editorRef.current.querySelector('.ProseMirror');
      if (!proseMirror) return;

      // Set initial height
      proseMirror.style.minHeight = '200px';

      // Calculate and set height based on content
      const scrollHeight = Math.max(200, proseMirror.scrollHeight);
      proseMirror.style.height = `${scrollHeight}px`;
    };

    // Setup observer for content changes
    const observer = new ResizeObserver(adjustHeight);
    const proseMirror = editorRef.current.querySelector('.ProseMirror');

    if (proseMirror) {
      observer.observe(proseMirror);
      adjustHeight(); // Initial adjustment

      // Also adjust on input/paste/keydown events for immediate feedback
      proseMirror.addEventListener('input', adjustHeight);
      proseMirror.addEventListener('paste', adjustHeight);
      proseMirror.addEventListener('keydown', () => {
        // Use setTimeout to ensure content has updated
        setTimeout(adjustHeight, 0);
      });
    }

    // Cleanup
    return () => {
      observer.disconnect();
      const proseMirror = editorRef.current?.querySelector('.ProseMirror');
      if (proseMirror) {
        proseMirror.removeEventListener('input', adjustHeight);
        proseMirror.removeEventListener('paste', adjustHeight);
        proseMirror.removeEventListener('keydown', () => setTimeout(adjustHeight, 0));
      }
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗'],
    'Activities': ['🎉', '🎊', '🎈', '🎂', '🎁', '🎮', '🎲', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱'],
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg w-full tiptap-container">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-white w-full">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive("bold")}
            className="h-8 w-8 px-0 data-[active=true]:bg-slate-100"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive("italic")}
            className="h-8 w-8 px-0 data-[active=true]:bg-slate-100"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive("bulletList")}
            className="h-8 w-8 px-0 data-[active=true]:bg-slate-100"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive("orderedList")}
            className="h-8 w-8 px-0 data-[active=true]:bg-slate-100"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 flex items-center gap-1 px-2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-2">
                  <h3 className="text-sm font-medium mb-1">{category}</h3>
                  <div className="grid grid-cols-6 gap-1">
                    {emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          editor.chain().focus().insertContent(emoji).run();
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <EditorContent ref={editorRef} editor={editor} className="h-full w-full" />
      </div>
    </div>
  );
}