import React, { useEffect, useState } from "react";

interface KeyboardAwareProps {
  children: React.ReactNode;
}

export const KeyboardAware: React.FC<KeyboardAwareProps> = ({ children }: KeyboardAwareProps) => {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (!visualViewport) return;

      const viewportHeight = visualViewport.height;
      const windowHeight = window.innerHeight;
      const diff = windowHeight - viewportHeight;

      if (diff > 50) {
        // Keyboard is likely visible
        setKeyboardHeight(diff);
        setIsKeyboardVisible(true);
        document.body.classList.add('keyboard-visible');
      } else {
        // Keyboard is likely hidden
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
        document.body.classList.remove('keyboard-visible');
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    // Initial check
    handleResize();

    // Prevent swiping on floating bar
    const preventSwipe = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.floating-bar')) {
        // Prevent default swipe behavior on floating bar
        e.stopPropagation();
      }
    };

    document.addEventListener('touchstart', preventSwipe, { passive: false });
    document.addEventListener('touchmove', preventSwipe, { passive: false });

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
      document.body.classList.remove('keyboard-visible');
      document.removeEventListener('touchstart', preventSwipe);
      document.removeEventListener('touchmove', preventSwipe);
    };
  }, []);

  useEffect(() => {
    // Set keyboard height as a CSS variable
    document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
  }, [keyboardHeight]);

  return (
    <div style={{ position: 'relative' }}>
      {children}
    </div>
  );
};