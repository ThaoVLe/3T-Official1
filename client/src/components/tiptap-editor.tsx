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
        class: 'focus:outline-none prose prose-h1:text-[30px] prose-h1:font-bold prose-h2:text-[20px] prose-h2:font-semibold prose-p:text-base prose-p:font-normal'
      }
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  const editorRef = useRef<HTMLDivElement>(null);

  // Auto-expand functionality
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    const adjustHeight = () => {
      const proseMirror = editorRef.current?.querySelector('.ProseMirror');
      if (!proseMirror) return;

      // Reset height to auto to get the correct scrollHeight
      (proseMirror as HTMLElement).style.height = 'auto';

      // Get the content height
      const contentHeight = proseMirror.scrollHeight;

      // Set the new height with a minimum of 200px
      (proseMirror as HTMLElement).style.height = `${Math.max(200, contentHeight)}px`;
    };

    // Setup mutation observer for content changes
    const observer = new MutationObserver(() => {
      requestAnimationFrame(adjustHeight);
    });

    const proseMirror = editorRef.current.querySelector('.ProseMirror');
    if (proseMirror) {
      observer.observe(proseMirror, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });

      // Initial adjustment
      adjustHeight();
    }

    return () => observer.disconnect();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👊', '✊', '🤛', '🤜', '🤚', '👋', '🖐️', '✋', '🖖'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗'],
    'Activities': ['🎉', '🎊', '🎈', '🎂', '🎁', '🎮', '🎲', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱'],
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar - Fixed at top */}
      <div className="flex-none flex flex-wrap items-center gap-1 p-2 bg-white border-b">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0"
            >
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="justify-start text-left data-[active=true]:bg-slate-100"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                data-active={editor.isActive('heading', { level: 1 })}
              >
                <span style={{ fontSize: '30px', fontWeight: 'bold' }}>Large Text</span>
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-left data-[active=true]:bg-slate-100"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                data-active={editor.isActive('heading', { level: 2 })}
              >
                <span style={{ fontSize: '20px', fontWeight: 'semibold' }}>Medium Text</span>
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-left data-[active=true]:bg-slate-100"
                onClick={() => editor.chain().focus().setParagraph().run()}
                data-active={!editor.isActive('heading')}
              >
                <span style={{ fontSize: '16px' }}>Small Text</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent 
          ref={editorRef}
          editor={editor} 
          className="h-full ProseMirror-focused"
        />
      </div>
    </div>
  );
}