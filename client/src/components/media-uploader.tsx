import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Camera, Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.top = '-100px';
    temporaryInput.style.left = '0';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.width = '100%';
    temporaryInput.style.fontSize = '16px';

    document.body.appendChild(temporaryInput);

    setTimeout(() => {
      temporaryInput.focus();
      setTimeout(() => {
        temporaryInput.blur();
        document.body.removeChild(temporaryInput);
      }, 50);
    }, 50);
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

  const triggerFileInput = (type: 'upload' | 'capture-photo' | 'capture-video') => {
    if (!fileInputRef.current) return;

    switch (type) {
      case 'upload':
        fileInputRef.current.accept = 'image/*,video/*,.mov,.MOV';
        fileInputRef.current.capture = undefined;
        break;
      case 'capture-photo':
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
              className={triggerClassName || "h-10 w-10 rounded-full bg-transparent hover:bg-accent"}
              disabled={disabled}
            >
              {triggerContent || (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3C12.5523 3 13 3.44772 13 4V11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H13V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H11V4C11 3.44772 11.4477 3 12 3Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => triggerFileInput('upload')}>
              <Image className="mr-2 h-4 w-4" />
              <span>Upload from Gallery</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Camera className="mr-2 h-4 w-4" />
                <span>Capture</span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => triggerFileInput('capture-photo')}>
                  <Image className="mr-2 h-4 w-4" />
                  <span>Take Photo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => triggerFileInput('capture-video')}>
                  <Camera className="mr-2 h-4 w-4" />
                  <span>Record Video</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}