import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
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
  Palette,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Placeholder } from '@tiptap/extension-placeholder';

// Sample emoticon categories for our emoji picker
const emojiCategories = {
  "Smileys & Emotion": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌"],
  "Activities": ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🎮", "🎲", "🧩", "🎭"],
  "Travel & Places": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚"],
  "Objects": ["⌚", "📱", "💻", "⌨️", "🖥️", "🖱️", "🖨️", "📷", "🎥", "🔋", "🔌", "💡"],
};

// Sample colors for text and highlighting
const colors = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3",
  "#FF69B4", "#FFC0CB", "#8B4513", "#000000", "#808080", "#FFFFFF", "#A52A2A",
  "#00FFFF", "#7FFFD4", "#FFA500", "#F0E68C", "#DDA0DD", "#FF00FF", "#800080"
];

export const TiptapEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (containerRef.current && contentRef.current) {
        adjustHeight();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Function to adjust editor height based on content
    function adjustHeight() {
      if (contentRef.current && containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const editorHeight = contentRef.current.clientHeight;
        const minHeight = 200; // Minimum editor height in px

        if (editorHeight < minHeight) {
          contentRef.current.style.minHeight = `${minHeight}px`;
        } else {
          contentRef.current.style.minHeight = `${containerHeight - 100}px`;
        }
      }
    }

    // Initial adjustment
    adjustHeight();

    return () => observer.disconnect();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg w-full tiptap-container">
      <div className="flex-grow overflow-y-auto p-4" ref={containerRef}>
        <div ref={contentRef}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex items-center justify-center border-t p-2 gap-1 bg-white w-full overflow-x-auto">
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
                  onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
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
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2">
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-1">
                {/* Emotion buttons will go here */}
              </div>
            </div>

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
  );
};