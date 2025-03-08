
import { useState, useEffect } from 'react';

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  useEffect(() => {
    function handleResize() {
      // Get visual viewport height (accounts for keyboard on mobile)
      const visualViewport = window.visualViewport;
      if (!visualViewport) return;
      
      const windowHeight = window.innerHeight;
      const viewportHeight = visualViewport.height;
      
      // If viewport height is less than window height, keyboard is likely showing
      if (viewportHeight < windowHeight) {
        const calculatedKeyboardHeight = windowHeight - viewportHeight;
        setKeyboardHeight(calculatedKeyboardHeight);
      } else {
        setKeyboardHeight(0);
      }
    }
    
    // Use visualViewport API if available (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }
    
    // Initial calculation
    handleResize();
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  
  return keyboardHeight;
}
