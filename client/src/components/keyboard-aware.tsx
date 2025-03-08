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
        document.documentElement.classList.add('keyboard-visible');

        // Prevent scrolling on the floating bar
        const floatingBar = document.querySelector('.floating-bar');
        if (floatingBar) {
          floatingBar.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        }
      } else {
        setIsKeyboardVisible(false);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.classList.remove('keyboard-visible');
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
      document.documentElement.classList.remove('keyboard-visible');

      // Cleanup touch event listeners
      const floatingBar = document.querySelector('.floating-bar');
      if (floatingBar) {
        floatingBar.removeEventListener('touchmove', (e) => e.preventDefault());
      }
    };
  }, []);

  return (
    <div className={`editor-container ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
      <div className="keyboard-adjustable-content">
        {children}
      </div>
    </div>
  );
}