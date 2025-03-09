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
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { KeyboardProvider, useKeyboard } from "@/lib/keyboard-context";

interface Entry {
  id?: string;
  feeling: { emoji: string; label: string } | null;
  location: string | null;
  // ... other entry properties
}

const EditEntryContent: React.FC<{ entry: Entry; onSave: (entry: Entry) => void }> = ({ entry, onSave }) => {
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(
    entry?.feeling
  );
  const [location, setLocation] = useState<string | null>(
    entry?.location || null
  );
  const [, navigate] = useLocation();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // References for swipe prevention
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingBarRef = useRef<HTMLDivElement>(null);
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchStartElement: HTMLElement | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;

      // Check if touch started in floating bar or outside editor area
      const isFloatingBarTouch = floatingBarRef.current?.contains(target);
      const isEditorAreaTouch = editorAreaRef.current?.contains(target);

      if (isFloatingBarTouch || !isEditorAreaTouch) {
        return; // Don't track touch if it started in floating bar or outside editor
      }

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      touchStartElement = target;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartElement) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      if (swipeDistance > 50 && swipeTime < 300 && verticalDistance < 30) {
        setShowSaveDialog(true);
      }

      touchStartElement = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
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
  };

  return (
    <>
      <div 
        ref={containerRef} 
        className={`min-h-screen flex flex-col bg-background ${isExiting ? 'pointer-events-none' : ''}`}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-3 border-b border-border bg-card sticky top-0 z-10">
          <div className="absolute top-3 right-4 sm:right-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveConfirm}
              className="bg-primary hover:bg-primary/90 whitespace-nowrap"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div ref={editorAreaRef} className="flex-1 relative">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6">
              {/* Your editor content here */}
            </div>
          </form>
        </div>

        {/* Floating Controls Bar */}
        <div 
          ref={floatingBarRef}
          className="fixed bottom-0 left-0 right-0 transform transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateY(${isKeyboardVisible ? -keyboardHeight : 0}px)`,
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          <div className="bg-background/80 backdrop-blur-sm border-t border-border p-2">
            <div className="flex items-center justify-between gap-4">
              <FeelingSelector
                selectedFeeling={feeling}
                onSelect={setFeeling}
              />
              <LocationSelector
                selectedLocation={location}
                onSelect={setLocation}
              />
            </div>
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

const EditEntry: React.FC<{ entry: Entry; onSave: (entry: Entry) => void }> = (props) => {
  return (
    <KeyboardProvider>
      <EditEntryContent {...props} />
    </KeyboardProvider>
  );
};

export default EditEntry;