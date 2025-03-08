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

        // Set the keyboard height CSS variable
        document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
        document.documentElement.classList.add('keyboard-visible');

        // Also set the viewport offset for better positioning
        const offsetTop = window.visualViewport.offsetTop || 0;
        document.documentElement.style.setProperty('--keyboard-offset', `${offsetTop}px`);

        // Set the current viewport height for better positioning calculations
        document.documentElement.style.setProperty('--viewport-height', `${currentHeight}px`);


      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.classList.remove('keyboard-visible');
      }

      lastVisualViewportHeight.current = currentHeight;
    };

    const handleResize = () => {
      requestAnimationFrame(updateKeyboardStatus);
    };

    // Listen for both visualViewport and window resize events
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    window.addEventListener('resize', handleResize);

    // Initial setup
    updateKeyboardStatus();

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
      document.documentElement.classList.remove('keyboard-visible');
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    };
  }, []);

  return (
    <div 
      className="editor-container"
      style={{ 
        minHeight: '100vh',
        minHeight: '-webkit-fill-available',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: `calc(100vh - var(--keyboard-height))` //Adjust height to account for keyboard
      }}
    >
      <div 
        ref={contentRef}
        className="keyboard-adjustable-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          paddingBottom: keyboardHeight // Add padding to prevent content from overlapping keyboard
        }}
      >
        {children}
      </div>
      {/* Floating bar -  Ensure this is styled appropriately to avoid overlap */}
      <div className="floating-bar" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%',  //Example styling
        transform: `translateY(calc(var(--keyboard-height) * -1))`, //Move up if keyboard is visible
      }}>
        {/* Floating bar content here */}
      </div>
    </div>
  );
}