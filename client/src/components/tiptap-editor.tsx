import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Highlighter,
  Smile,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading,
  Type,
  Palette,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect } from "react";

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
          levels: [1, 2, 3],
          HTMLAttributes: {
            1: 'text-4xl font-bold mb-4',
            2: 'text-3xl font-bold mb-3',
            3: 'text-2xl font-bold mb-2'
          }
        }
      }),
      CodeBlockLowlight,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      TextStyle,
      Color,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      console.log('Editor content updated:', editor.getHTML());
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] px-4 text-base leading-relaxed text-gray-900'
      }
    }
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      console.log('Updating editor content:', value);
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

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

  return (
    <div className="h-full flex flex-col bg-white rounded-lg">
      <div className="flex items-center gap-0.5 p-2 border-b bg-white">
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive("bold")}
            className="h-8 px-2 data-[active=true]:bg-slate-100"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive("italic")}
            className="h-8 px-2 data-[active=true]:bg-slate-100"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Heading Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 flex items-center gap-1"
              >
                <Type className="h-4 w-4" />
                <span className="text-xs">Heading</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-1">
                {[1, 2, 3].map((level) => (
                  <Button
                    key={level}
                    variant="ghost"
                    className="justify-start font-bold"
                    style={{ 
                      fontSize: `${1.5 - (level-1)*0.25}rem` 
                    }}
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                    data-active={editor.isActive('heading', { level })}
                  >
                    Heading {level}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <Palette className="h-4 w-4" />
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

          {/* Highlight Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <Highlighter className="h-4 w-4" />
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

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive("bulletList")}
            className="h-8 px-2 data-[active=true]:bg-slate-100"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive("orderedList")}
            className="h-8 px-2 data-[active=true]:bg-slate-100"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            data-active={editor.isActive("link")}
            className="h-8 px-2 data-[active=true]:bg-slate-100"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          {/* Emoji Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-2">
                  <h3 className="text-sm font-medium mb-1">{category}</h3>
                  <div className="grid grid-cols-8 gap-1">
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

      <div className="flex-1">
        <EditorContent editor={editor} className="h-full prose prose-lg max-w-none" />
      </div>
    </div>
  );
}