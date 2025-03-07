import React, { useState, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { Popover, PopoverTrigger, PopoverContent, Button, Command, CommandList, CommandGroup, CommandItem } from '@chakra-ui/react';
import { ImageIcon, FolderOpenIcon } from '@chakra-ui/icons';


export default function MediaUploader({ onUpload, disabled }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
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

  const handleFileChange = async (event) => {
    hideKeyboard();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // ... rest of the handleFileChange function remains unchanged ...
    }
  };

  return (
    <>
      <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ImageIcon className="h-8 w-8" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        document.getElementById("media-upload")?.click();
                      }}
                    >
                      <FolderOpenIcon className="mr-2 h-4 w-4" />
                      <span>Gallery</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <input
        id="media-upload"
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}