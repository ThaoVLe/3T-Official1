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
        class: 'focus:outline-none min-h-[300px] px-4 prose dark:prose-invert prose-h1:text-[30px] prose-h1:font-bold prose-h2:text-[20px] prose-h2:font-semibold prose-p:text-base prose-p:font-normal text-foreground'
      }
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  const editorRef = useRef<HTMLDivElement>(null);
  const contentHeight = useRef<number>(200);

  useEffect(() => {
    if (!editor || !editorRef.current) return;

    const adjustHeight = () => {
      if (!editorRef.current) return;

      editorRef.current.style.height = 'auto';
      const scrollHeight = editorRef.current.querySelector('.ProseMirror')?.scrollHeight || 200;
      contentHeight.current = Math.max(contentHeight.current, scrollHeight);
      editorRef.current.style.height = `${contentHeight.current}px`;
    };

    const observer = new MutationObserver(adjustHeight);
    const proseMirror = editorRef.current.querySelector('.ProseMirror');

    if (proseMirror) {
      observer.observe(proseMirror, {
        childList: true,
        subtree: true,
        characterData: true
      });
      adjustHeight();
    }

    return () => observer.disconnect();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  ];

  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👊', '✊', '🤛', '🤜', '🤚', '👋', '🖐️', '✋', '🖖'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗'],
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg w-full tiptap-container">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card w-full">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive("bold")}
            className="h-8 w-8 px-0 data-[active=true]:bg-accent"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive("italic")}
            className="h-8 w-8 px-0 data-[active=true]:bg-accent"
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
            className="h-8 w-8 px-0 data-[active=true]:bg-accent"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive("orderedList")}
            className="h-8 w-8 px-0 data-[active=true]:bg-accent"
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
                className="h-8 w-8 px-0"
              >
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="justify-start text-left data-[active=true]:bg-accent"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  data-active={editor.isActive('heading', { level: 1 })}
                >
                  <span className="text-[30px] font-bold">Large Text</span>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-left data-[active=true]:bg-accent"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  data-active={editor.isActive('heading', { level: 2 })}
                >
                  <span className="text-[20px] font-semibold">Medium Text</span>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-left data-[active=true]:bg-accent"
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  data-active={!editor.isActive('heading')}
                >
                  <span className="text-[16px]">Small Text</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 flex items-center gap-1 px-2"
              >
                <Smile className="h-4 w-4 mr-1" />
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

      <div className="flex-1 w-full bg-background">
        <EditorContent ref={editorRef} editor={editor} className="h-full w-full" />
      </div>
    </div>
  );
}