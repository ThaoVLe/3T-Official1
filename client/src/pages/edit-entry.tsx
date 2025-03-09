import React, { useState, useEffect, useRef } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Entry {
  id?: string;
  feeling: { emoji: string; label: string } | null;
  location: string | null;
  // ... other entry properties
}

const EditEntry: React.FC<{ entry: Entry; onSave: (entry: Entry) => void }> = ({ entry, onSave }) => {
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(
    entry?.feeling
  );
  const [location, setLocation] = useState<string | null>(
    entry?.location || null
  );
  const [, navigate] = useLocation();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Reference for swipe prevention
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingBarRef = useRef<HTMLDivElement>(null);
  const editorAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchStartElement: HTMLElement | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      // Check if touch started inside the editing area or floating bar
      const target = e.target as HTMLElement;
      const isInsideEditor = editorAreaRef.current?.contains(target);
      const isInsideFloatingBar = floatingBarRef.current?.contains(target);

      // Only allow swipe if touch is NOT inside editor area or floating bar
      if (isInsideEditor || isInsideFloatingBar) {
        return;
      }

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      touchStartElement = target;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartElement) return;

      const touchMoveX = e.touches[0].clientX;
      const touchMoveY = e.touches[0].clientY;
      const verticalDistance = Math.abs(touchMoveY - touchStartY);

      // Prevent vertical scrolling interference
      if (verticalDistance > 30) return;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartElement) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      // If swiped far enough or fast enough (distance > 50px, time < 300ms, not too much vertical movement)
      if ((swipeDistance > 80 || (swipeDistance > 50 && swipeTime < 300)) && verticalDistance < 30) {
        // Show save dialog
        setShowSaveDialog(true);
      }

      touchStartElement = null;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...entry, feeling, location });
  };

  const handleCancel = () => {
    setShowSaveDialog(false);
    if (entry?.id) {
      setIsExiting(true);
      setTimeout(() => navigate(`/entry/${entry.id}`), 100);
    } else {
      setIsExiting(true);
      setTimeout(() => navigate('/'), 100);
    }
  };

  const handleSaveConfirm = () => {
    if (formRef.current) {
      const event = new Event('submit', { cancelable: true, bubbles: true });
      formRef.current.dispatchEvent(event);
    }
    setShowSaveDialog(false);

    // Add exit animation
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
      containerRef.current.style.transform = 'translateX(-20px)';
      containerRef.current.style.opacity = '0';
    }
  };

  return (
    <>
      <div 
        ref={containerRef} 
        className={`min-h-screen flex flex-col bg-background ${isExiting ? 'pointer-events-none' : ''}`}
      >
        <div ref={editorAreaRef} className="flex-1">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2 items-center">
              <FeelingSelector
                onSelect={setFeeling}
                selectedFeeling={feeling}
              />
              <LocationSelector
                onSelect={setLocation}
                selectedLocation={location}
              />
            </div>
            {/* ... other form elements */}
            <button type="submit">Save</button>
          </form>
        </div>

        {/* Floating Controls Bar */}
        <div 
          ref={floatingBarRef} 
          className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-2"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-between">
            {/* Floating bar content */}
          </div>
        </div>
      </div>

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save your changes before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveConfirm}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditEntry;