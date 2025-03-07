import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  triggerClassName?: string;
  triggerContent?: React.ReactNode;
}

export default function MediaUploader({ onUpload, disabled, triggerClassName, triggerContent }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Function to hide keyboard on mobile devices
  const hideKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const temporaryInput = document.createElement('input');
    temporaryInput.setAttribute('type', 'text');
    temporaryInput.style.position = 'absolute';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.fontSize = '16px';

    document.body.appendChild(temporaryInput);
    temporaryInput.focus();
    temporaryInput.blur();
    document.body.removeChild(temporaryInput);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    hideKeyboard();

    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }

      setIsUploading(true);
      try {
        await onUpload(file);
        toast({
          title: "Success",
          description: "Media uploaded successfully",
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: "Please try again",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
        // Reset file input
        event.target.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <Button
          variant="ghost"
          size="icon"
          disabled
          className={triggerClassName || "h-10 w-10 rounded-full"}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      ) : (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              hideKeyboard();
              const choice = Math.random() > 0.5; // Randomly choose input to simulate unified button
              if (choice) {
                imageInputRef.current?.click();
              } else {
                videoInputRef.current?.click();
              }
            }}
            disabled={disabled}
            className={triggerClassName || "h-10 w-10 rounded-full"}
            title="Upload media"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}