
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  ImageIcon
} from "lucide-react";
import { useCallback, useRef } from "react";
import "./tiptap-editor.css";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export function TipTapEditor({
  content,
  onChange,
  onUploadImage,
}: TipTapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        if (!onUploadImage) return;

        const url = await onUploadImage(file);
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    },
    [editor, onUploadImage]
  );

  const handleImageInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadImage(file);
      }
      // Reset the input
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    [uploadImage]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-container border rounded-md">
      <div className="editor-toolbar border-b p-1 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={editor.isActive("bold") ? "bg-accent" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={editor.isActive("italic") ? "bg-accent" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        {onUploadImage && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageInputChange}
            />
          </>
        )}
      </div>
      <EditorContent editor={editor} className="p-3 min-h-[200px]" />
    </div>
  );
}
