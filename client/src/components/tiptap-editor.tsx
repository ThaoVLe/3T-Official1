
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Code, AlignLeft, AlignCenter, AlignRight, Link2, Highlighter, Heading1, Heading2, Heading3, List, ListOrdered } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlock,
      Placeholder.configure({
        placeholder: 'Write your thoughts here...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const toggleHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleAlign = (alignment: 'left' | 'center' | 'right') => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const setLink = (url: string) => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg p-4">
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => toggleHeading(1)}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => toggleHeading(2)}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="icon" variant="ghost">
              <AlignLeft className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => toggleAlign('left')}
              className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => toggleAlign('center')}
              className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => toggleAlign('right')}
              className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="icon" variant="ghost">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 bg-current" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-2 flex flex-wrap gap-1">
                {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#980000', '#ff7f50'].map(
                  (color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      style={{ backgroundColor: color }}
                      onClick={() => setColor(color)}
                    />
                  )
                )}
              </TabsContent>
              <TabsContent value="background" className="mt-2 flex flex-wrap gap-1">
                {['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'].map(
                  (color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      style={{ backgroundColor: color }}
                      onClick={() => setHighlight(color)}
                    />
                  )
                )}
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="icon" variant="ghost">
              <Link2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="flex flex-col gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLink((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLink('')}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).closest('.flex-col')?.querySelector('input');
                    if (input) {
                      setLink(input.value);
                    }
                  }}
                >
                  Set Link
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <EditorContent editor={editor} className="prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[200px] focus:outline-none" />
    </div>
  );
};

export default TipTapEditor;
