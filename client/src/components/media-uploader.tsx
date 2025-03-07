import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video, Loader2, Camera, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  triggerClassName?: string;
  triggerContent?: React.ReactNode;
}

export default function MediaUploader({ onUpload, disabled, triggerClassName, triggerContent }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      // Validate file type with broader video format support
      const isImage = file.type.startsWith('image/');
      const isVideo = /\.(mp4|webm|mov|MOV|quicktime)$/i.test(file.name) || 
                     file.type.startsWith('video/') || 
                     file.type === 'video/quicktime';

      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 100MB for videos, 20MB for images)
      const maxSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `Please select a file smaller than ${isVideo ? '100MB' : '20MB'}`,
          variant: "destructive"
        });
        return;
      }

      setIsUploading(true);
      try {
        await onUpload(file);
        toast({
          title: "Success",
          description: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
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
        event.target.value = '';
      }
    }
  };

  const triggerFileInput = (type: 'image' | 'video' | 'capture-image' | 'capture-video') => {
    if (!fileInputRef.current) return;

    switch (type) {
      case 'image':
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.capture = undefined;
        break;
      case 'video':
        fileInputRef.current.accept = 'video/mp4,video/quicktime,video/webm,.mov,.MOV';
        fileInputRef.current.capture = undefined;
        break;
      case 'capture-image':
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.capture = 'environment';
        break;
      case 'capture-video':
        fileInputRef.current.accept = 'video/*';
        fileInputRef.current.capture = 'environment';
        break;
    }

    fileInputRef.current.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={triggerClassName || "h-10 w-10 rounded-full"}
              disabled={disabled}
            >
              {triggerContent || <Image className="h-5 w-5" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => triggerFileInput('image')}>
              <Image className="mr-2 h-4 w-4" />
              <span>Upload Image</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => triggerFileInput('video')}>
              <Video className="mr-2 h-4 w-4" />
              <span>Upload Video</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => triggerFileInput('capture-image')}>
              <Camera className="mr-2 h-4 w-4" />
              <span>Take Photo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => triggerFileInput('capture-video')}>
              <Camera className="mr-2 h-4 w-4" />
              <span>Record Video</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}