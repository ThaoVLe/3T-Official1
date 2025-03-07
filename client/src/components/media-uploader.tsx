
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video, Paperclip, X, Upload } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface MediaUploaderProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function MediaUploader({ onUpload, disabled = false }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Function to hide keyboard on mobile devices
  const hideKeyboard = () => {
    // Force any active element to lose focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // iOS specific fix - create and remove an input to force keyboard dismissal
    const temporaryInput = document.createElement('input');
    temporaryInput.setAttribute('type', 'text');
    temporaryInput.style.position = 'absolute';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.fontSize = '16px'; // iOS won't zoom in on inputs with font size >= 16px

    document.body.appendChild(temporaryInput);
    temporaryInput.focus();
    temporaryInput.blur();
    document.body.removeChild(temporaryInput);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    hideKeyboard();
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsUploading(true);
    setProgress(0);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      };
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUpload(response.url);
          toast({
            title: "File uploaded successfully",
            description: "Your media has been added to the entry.",
          });
        } else {
          let errorMessage = "Failed to upload file";
          try {
            const error = JSON.parse(xhr.responseText);
            errorMessage = error.message || errorMessage;
          } catch (e) {
            // Parsing error, use default message
          }
          
          toast({
            title: "Upload failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
        setIsUploading(false);
      };
      
      xhr.onerror = function() {
        toast({
          title: "Upload failed",
          description: "An error occurred during upload. Please try again.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred during upload. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex items-center">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          id="media-upload"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <label htmlFor="media-upload">
          <div className="relative">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={disabled || isUploading}
            >
              <Paperclip className="h-5 w-5" />
              {isUploading && (
                <div 
                  className="absolute inset-0 rounded-full border-2 border-primary" 
                  style={{ 
                    clipPath: `inset(0 ${100 - progress}% 0 0)`,
                    transition: 'clip-path 0.2s ease-in-out'
                  }}
                />
              )}
            </Button>
            
            {isUploading && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {progress}%
              </span>
            )}
          </div>
        </label>
      </div>
      
      {isUploading && (
        <div className="ml-2 text-sm text-muted-foreground">
          Uploading... {progress}%
        </div>
      )}
    </div>
  );
}
