
import React, { useEffect, useState } from "react";

interface KeyboardAwareProps {
  children: React.ReactNode;
}

export function KeyboardAware({ children }: KeyboardAwareProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    function handleResize() {
      const visualViewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      
      // If visual viewport is smaller than window height, keyboard is likely visible
      if (visualViewportHeight < windowHeight) {
        const keyboardHeight = windowHeight - visualViewportHeight;
        setKeyboardHeight(keyboardHeight);
        setIsKeyboardVisible(true);
        
        // Set CSS variable for the keyboard height
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      } else {
        setIsKeyboardVisible(false);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      }
    }

    // Listen for visual viewport resize events (for iOS)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    // Fallback for devices without visualViewport API
    window.addEventListener('resize', handleResize);
    
    // Run once on mount to set initial state
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`keyboard-aware ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
      {children}
    </div>
  );
}
