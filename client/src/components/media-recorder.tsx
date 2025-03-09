import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaRecorderProps {
  onCapture: (file: File) => void;
  className?: string;
  uploadProgress?: number;
}

export default function MediaRecorder({ onCapture, className }: MediaRecorderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setIsUploading(true);
    try {
      // Process files sequentially to maintain order
      for (const file of Array.from(files)) {
        await onCapture(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        id="media-upload"
        onChange={(e) => handleFiles(e.target.files)}
        multiple
      />

      <div className="flex gap-2">
        <label htmlFor="media-upload">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="h-10 w-10" 
            disabled={isUploading}
          >
            <ImageIcon className="h-8 w-8" /> {/* Icon size adjusted */}
          </Button>
        </label>
      </div>
    </div>
  );
}