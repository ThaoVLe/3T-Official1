import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { useState, useEffect, useCallback } from 'react';
import { Bold, Italic, List, Heading1, Heading2, Underline, Strikethrough } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TipTapEditor = ({ value, onChange }: TipTapEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Initialize the editor with all extensions upfront
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      BubbleMenu.configure({
        element: document.querySelector('.bubble-menu') as HTMLElement,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Set content whenever value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Mark as mounted on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', 
    '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff', '#980000', '#ff0000',
    '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff',
    '#9900ff', '#ff00ff', '#ff1493'
  ];

  const highlights = [
    '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  ];

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleH1 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  }, [editor]);

  const toggleH2 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const setColor = useCallback((color: string) => {
    editor?.chain().focus().setColor(color).run();
  }, [editor]);

  const setHighlight = useCallback((color: string) => {
    editor?.chain().focus().toggleHighlight({ color }).run();
  }, [editor]);

  if (!isMounted) {
    return null;
  }

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="relative min-h-[400px]">
      <div className="sticky top-0 z-10 bg-white border-b mb-4 p-2 flex flex-wrap gap-1 items-center">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={toggleBold}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={toggleItalic}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={toggleUnderline}
          aria-label="Underline"
        >
          <Underline className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={toggleStrike}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={toggleH1}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={toggleH2}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={toggleBulletList}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Text color</span>
              <div 
                className="h-4 w-4 rounded" 
                style={{ 
                  backgroundColor: editor.getAttributes('textStyle').color || '#000000',
                  border: '1px solid #ddd'
                }} 
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-7 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                  onClick={() => setColor(color)}
                  aria-label={`Set text color to ${color}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Highlight color</span>
              <div 
                className="h-4 w-4 rounded border border-gray-200" 
                style={{ 
                  backgroundColor: editor.getAttributes('highlight').color || 'transparent',
                  opacity: 0.5
                }} 
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-8 gap-1">
              {highlights.map((color) => (
                <button
                  key={color}
                  className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                  onClick={() => setHighlight(color)}
                  aria-label={`Set highlight color to ${color}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <EditorContent 
        editor={editor} 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px]" 
      />
    </div>
  );
};

export default TipTapEditor;