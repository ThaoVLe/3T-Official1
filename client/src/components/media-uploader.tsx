import React, { useState, useRef } from 'react';
import { useToast } from '@chakra-ui/react';

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

  // ... rest of the MediaUploader component remains unchanged ...
}