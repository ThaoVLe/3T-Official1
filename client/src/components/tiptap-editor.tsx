import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input component
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Placeholder from '@tiptap/extension-placeholder'; //Import Placeholder extension

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
        class: 'focus:outline-none min-h-[200px] px-4 prose prose-h1:text-[30px] prose-h1:font-bold prose-h2:text-[20px] prose-h2:font-semibold prose-p:text-base prose-p:font-normal'
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

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  ];

  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👊', '✊', '🤛', '🤜', '🤚', '👋', '🖐️', '✋', '🖖'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗'],
    'Activities': ['🎉', '🎊', '🎈', '🎂', '🎁', '🎮', '🎲', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱'],
  };

  const editorRef = useRef<HTMLDivElement>(null);
  const contentHeight = useRef<number>(200); // Initial minimum height

  useEffect(() => {
    if (!editor || !editorRef.current) return;

    // Function to adjust editor height based on content
    const adjustHeight = () => {
      if (!editorRef.current) return;

      // Reset height first to get proper scrollHeight
      editorRef.current.style.height = 'auto';

      // Get the actual content height
      const scrollHeight = editorRef.current.querySelector('.ProseMirror')?.scrollHeight || 200;

      // Only grow, never shrink below the minimum or current height
      contentHeight.current = Math.max(contentHeight.current, scrollHeight);

      // Set the height
      editorRef.current.style.height = `${contentHeight.current}px`;
    };

    // Setup mutation observer for content changes
    const observer = new MutationObserver(adjustHeight);

    const proseMirror = editorRef.current.querySelector('.ProseMirror');
    if (proseMirror) {
      observer.observe(proseMirror, { 
        childList: true, 
        subtree: true,
        characterData: true
      });

      // Initial adjustment
      adjustHeight();
    }

    return () => observer.disconnect();
  }, [editor]);



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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            data-active={editor.isActive("link")}
            className="h-8 w-8 px-0 data-[active=true]:bg-slate-100"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 px-0"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px]">A</span>
                  <div className="h-1 w-4 bg-red-500 rounded-sm" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-10 gap-1">
                {colors.map((color) => (
                  <Button
                    key={color}
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 px-0"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] bg-yellow-200 px-1">A</span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-10 gap-1">
                {colors.map((color) => (
                  <Button
                    key={color}
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setHighlight({ color }).run()}
                  />
                ))}
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
                <span className="text-xs">Feeling</span>
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2">
              <div className="mb-3">
                <div className="flex gap-2">
                  <Input 
                    id="customEmotion"
                    placeholder="What are you doing today?"
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        const value = input.value.trim();
                        if (value) {
                          // Insert the custom emotion with dark red color
                          editor.chain().focus().setColor('#880000').insertContent(value).setColor('default').run();

                          // Save to localStorage (keeping both for backward compatibility)
                          const savedEmotions = JSON.parse(localStorage.getItem('customEmotions') || '[]');
                          if (!savedEmotions.includes(value)) {
                            savedEmotions.push(value);
                            localStorage.setItem('customEmotions', JSON.stringify(savedEmotions));
                          }
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    className="shrink-0"
                    onClick={() => {
                      const input = document.getElementById('customEmotion') as HTMLInputElement;
                      const value = input.value.trim();
                      if (value) {
                        // Insert the custom emotion with dark red color
                        editor.chain().focus().setColor('#880000').insertContent(value).setColor('default').run();

                        // Save to localStorage
                        const savedEmotions = JSON.parse(localStorage.getItem('customEmotions') || '[]');
                        if (!savedEmotions.includes(value)) {
                          savedEmotions.push(value);
                          localStorage.setItem('customEmotions', JSON.stringify(savedEmotions));
                        }
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Saved feelings section removed */}

              {/* Standard emoji categories */}
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

      <div className="flex-1 w-full">
        <EditorContent ref={editorRef} editor={editor} className="h-full w-full" />
      </div>
    </div>
  );
}