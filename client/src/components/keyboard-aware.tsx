
import React, { useState, useEffect } from "react";

interface KeyboardAwareProps {
  children: React.ReactNode;
}

export function KeyboardAware({ children }: KeyboardAwareProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (!window.visualViewport) return;
      
      const visualViewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // If visual viewport is smaller than window height, keyboard is likely visible
      if (visualViewportHeight < windowHeight - 10) { // 10px threshold for detection
        const keyboardHeight = windowHeight - visualViewportHeight;
        setKeyboardHeight(keyboardHeight);
        setIsKeyboardVisible(true);
        
        // Set CSS variable for the keyboard height
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      }
    }

    // Handle viewport offset changes due to keyboard or scrolling
    function handleScroll() {
      if (!window.visualViewport || !isKeyboardVisible) return;
      
      // Update position of elements that should stay above keyboard
      // by using the visualViewport's offsetTop
      const offsetTop = window.visualViewport.offsetTop;
      document.documentElement.style.setProperty('--keyboard-offset-top', `${offsetTop}px`);
    }

    // Listen for visual viewport events (better on iOS)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleScroll);
    }
    
    // Fallback for devices without visualViewport API
    window.addEventListener('resize', handleResize);
    
    // Run once on mount to set initial state
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isKeyboardVisible]);

  return (
    <div className={`keyboard-aware ${isKeyboardVisible ? 'keyboard-visible' : ''}`} style={{ 
      // This ensures content doesn't get hidden behind keyboard
      paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0'
    }}>
      {children}
    </div>
  );
}
