import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface MediaRecorderProps {
  onCapture: (file: File) => void;
  className?: string;
}

export default function MediaRecorder({ onCapture, className }: MediaRecorderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Process files sequentially to maintain order
      for (const file of Array.from(files)) {
        setUploadProgress(0); // Reset progress for each file
        await onCapture(file);
        setUploadProgress(100);
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
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center ${className}`}>
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
              className="h-9 w-9"
              disabled={isUploading}
              asChild
            >
              <span>
                <ImageIcon className="h-5 w-5" />
              </span>
            </Button>
          </label>
        </div>
      </div>

      {isUploading && (
        <div className="w-full max-w-[200px]">
          <Progress 
            value={uploadProgress} 
            className="h-1 bg-primary/20" 
            indicatorClassName="bg-primary transition-all" 
          />
        </div>
      )}
    </div>
  );
}