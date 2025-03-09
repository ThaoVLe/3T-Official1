import React, { useEffect, useState, useRef } from "react";

interface KeyboardAwareProps {
  children: React.ReactNode;
}

export function KeyboardAware({ children }: KeyboardAwareProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastVisualViewportHeight = useRef<number>(window.innerHeight);

  useEffect(() => {
    const updateKeyboardStatus = () => {
      if (!window.visualViewport) return;

      const currentHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const heightDifference = windowHeight - currentHeight;

      // Only consider it a keyboard if the height difference is significant (> 100px)
      if (heightDifference > 100) {
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDifference);

        // Set CSS variables for keyboard height
        document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
        document.documentElement.classList.add('keyboard-visible');

        // Adjust viewport height
        document.documentElement.style.setProperty('--viewport-height', `${currentHeight}px`);
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.classList.remove('keyboard-visible');
        document.documentElement.style.setProperty('--viewport-height', `${windowHeight}px`);
      }

      lastVisualViewportHeight.current = currentHeight;
    };

    // Setup event listeners for keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateKeyboardStatus);
      window.visualViewport.addEventListener('scroll', updateKeyboardStatus);
    }
    window.addEventListener('resize', updateKeyboardStatus);

    // Initial setup
    updateKeyboardStatus();

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateKeyboardStatus);
        window.visualViewport.removeEventListener('scroll', updateKeyboardStatus);
      }
      window.removeEventListener('resize', updateKeyboardStatus);
      document.documentElement.classList.remove('keyboard-visible');
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    };
  }, []);

  return (
    <div 
      className="editor-container"
      style={{ 
        height: isKeyboardVisible ? `calc(100vh - ${keyboardHeight}px)` : '100vh',
      }}
    >
      <div 
        ref={contentRef}
        className="keyboard-adjustable-content"
        style={{
          height: isKeyboardVisible ? `calc(100vh - ${keyboardHeight}px)` : '100vh',
          paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : 'env(safe-area-inset-bottom)',
        }}
      >
        {children}
      </div>
    </div>
  );
}