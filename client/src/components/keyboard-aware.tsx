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

        // Ensure the content is scrolled into view when keyboard appears
        if (contentRef.current && document.activeElement instanceof HTMLElement) {
          const activeElement = document.activeElement;
          const elementRect = activeElement.getBoundingClientRect();
          const elementBottom = elementRect.bottom;

          if (elementBottom > currentHeight) {
            const scrollOffset = elementBottom - currentHeight + 20; // 20px buffer
            contentRef.current.scrollTop += scrollOffset;
          }
        }
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
        height: window.visualViewport?.height || '100vh'
      }}
    >
      <div 
        ref={contentRef}
        className="keyboard-adjustable-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';

import React, { useEffect, useRef, useState } from 'react';

interface KeyboardAwareProps {
  contentRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export const KeyboardAware: React.FC<KeyboardAwareProps> = ({ contentRef, children }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const lastVisualViewportHeight = useRef<number>(window.visualViewport?.height || window.innerHeight);

  useEffect(() => {
    if (!window.visualViewport) {
      return;
    }

    // Store initial viewport height
    lastVisualViewportHeight.current = window.visualViewport.height;
    
    const updateKeyboardStatus = () => {
      if (!window.visualViewport) {
        return;
      }
      
      const currentHeight = window.visualViewport.height;
      const heightDifference = lastVisualViewportHeight.current - currentHeight;
      
      // If the viewport height decreased significantly, keyboard is likely visible
      if (heightDifference > 150) {
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDifference);
        document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
        document.documentElement.classList.add('keyboard-visible');
        
        // Ensure the content is scrolled into view when keyboard appears
        if (contentRef?.current && document.activeElement instanceof HTMLElement) {
          const activeElement = document.activeElement;
          const elementRect = activeElement.getBoundingClientRect();
          const elementBottom = elementRect.bottom;

          if (elementBottom > currentHeight) {
            const scrollOffset = elementBottom - currentHeight + 20; // 20px buffer
            contentRef.current.scrollTop += scrollOffset;
          }
        }
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
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    window.addEventListener('resize', handleResize);
    
    // Initial application of viewport height
    document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`);
    
    // Initial setup
    updateKeyboardStatus();
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
    };

      const currentHeight = window.visualViewport.height;
      const heightDifference = lastVisualViewportHeight.current - currentHeight;
      
      // Check if keyboard is visible (height decreases significantly)
      if (heightDifference > 150) {
        // Keyboard is likely visible
        const calculatedKeyboardHeight = heightDifference;
        setKeyboardHeight(calculatedKeyboardHeight);
        setIsKeyboardVisible(true);
        
        document.documentElement.style.setProperty('--keyboard-height', `${calculatedKeyboardHeight}px`);
        document.documentElement.classList.add('keyboard-visible');
        
        // Ensure the floating bar stays in position
        const floatingBar = document.querySelector('.floating-bar');
        if (floatingBar) {
          floatingBar.classList.add('keyboard-fixed');
        }
      } else {
        // Keyboard is likely hidden
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.classList.remove('keyboard-visible');
        
        // Reset floating bar position
        const floatingBar = document.querySelector('.floating-bar');
        if (floatingBar) {
          floatingBar.classList.remove('keyboard-fixed');
        }
      }

      lastVisualViewportHeight.current = currentHeight;
    };

    window.visualViewport.addEventListener('resize', handleResize);

    // Initial application of viewport height
    document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`);
    
    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className={`keyboard-adjustable-content ${isKeyboardVisible ? 'keyboard-visible' : ''}`} 
      style={{ 
        position: 'relative',
        paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0'
      }}
    >
      {children}
    </div>
  );
};
