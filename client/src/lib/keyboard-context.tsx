import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface KeyboardContextType {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

const KeyboardContext = createContext<KeyboardContextType | null>(null);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const keyboardIsShown = vh < window.innerHeight;
      const newKeyboardHeight = keyboardIsShown ? window.innerHeight - vh : 0;

      setKeyboardHeight(newKeyboardHeight);
      setIsKeyboardVisible(keyboardIsShown);

      // Update CSS variables for smooth transitions
      document.documentElement.style.setProperty('--keyboard-height', `${newKeyboardHeight}px`);
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  return (
    <KeyboardContext.Provider value={{ isKeyboardVisible, keyboardHeight }}>
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
}
