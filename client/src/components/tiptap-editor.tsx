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
  Code,
  Link as LinkIcon,
  Type,
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
            1: { class: 'text-4xl font-bold mb-4' },
            2: { class: 'text-3xl font-bold mb-3' },
            3: { class: 'text-2xl font-bold mb-2' }
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
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] px-4 text-base leading-relaxed text-gray-900'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

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
                      fontSize: `${1.5 - (level - 1) * 0.25}rem`
                    }}
                    onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
                    data-active={editor.isActive('heading', { level })}
                  >
                    Heading {level}
                  </Button>
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
            onClick={() => {
              const url = window.prompt('Enter the link URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            data-active={editor.isActive("link")}
            className="h-8 px-2 data-[active=true]:bg-slate-100"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}