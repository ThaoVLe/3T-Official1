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
import { ArrowLeft, Check, FileEdit, MapPin, X } from "lucide-react"; // Changed import

interface Entry {
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
  // ... other state variables

  // Reference to track swipe animation
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDragging = false;
    let currentTranslateX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Check if touch started inside the editing area or floating bar
      const target = e.target as HTMLElement;
      const isInsideEditor = target.closest('.tiptap-container, .ProseMirror') !== null;
      const isInsideFloatingBar = target.closest('.floating-bar') !== null;

      // Only allow swipe if touch is NOT inside editor area
      if (isInsideEditor || isInsideFloatingBar) {
        isDragging = false;
        return;
      }

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isDragging = true;

      // Reset transition during drag
      if (containerRef.current) {
        containerRef.current.style.transition = 'none';
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const touchMoveX = e.touches[0].clientX;
      const touchMoveY = e.touches[0].clientY;
      const verticalDistance = Math.abs(touchMoveY - touchStartY);

      // Prevent vertical scrolling interference
      if (verticalDistance > 30) return;

      // Calculate the horizontal distance moved
      const moveDistance = touchMoveX - touchStartX;

      // Only allow right swipes (positive distance)
      if (moveDistance > 0) {
        currentTranslateX = moveDistance;

        // Apply transform with damping effect (using sqrt for more natural feel)
        if (containerRef.current) {
          const dampenedDistance = Math.sqrt(moveDistance) * 6;
          containerRef.current.style.transform = `translateX(${Math.min(dampenedDistance, 100)}px)`;

          // Gradually increase opacity of backdrop as user swipes
          const opacity = Math.min(moveDistance / 150, 0.5);
          containerRef.current.style.boxShadow = `-5px 0 15px rgba(0, 0, 0, ${opacity})`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      // Add transition for smooth animation back to original position
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
      }

      // If swiped far enough or fast enough (distance > 50px, time < 300ms, not too much vertical movement)
      if ((swipeDistance > 80 || (swipeDistance > 50 && swipeTime < 300)) && verticalDistance < 30) {
        // Show save dialog
        setShowSaveDialog(true);

        // Animate back to original position
        if (containerRef.current) {
          containerRef.current.style.transform = 'translateX(0)';
          containerRef.current.style.boxShadow = 'none';
        }
      } else {
        // Not swiped far enough, animate back to original position
        if (containerRef.current) {
          containerRef.current.style.transform = 'translateX(0)';
          containerRef.current.style.boxShadow = 'none';
        }
      }
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
    onSave({ ...entry, feeling, location }); // ... other properties
  };

  const handleSaveConfirm = () => {
    if (formRef.current) {
      // Trigger the form submission
      const event = new Event('submit', { cancelable: true, bubbles: true });
      formRef.current.dispatchEvent(event);
    }
    setShowSaveDialog(false);
  };

  const handleCancel = () => {
    setShowSaveDialog(false);
    if (entry?.id) {
      setIsExiting(true);
      // Match the entry-view animation timing
      setTimeout(() => navigate(`/entry/${entry.id}`), 100);
    } else {
      setIsExiting(true);
      setTimeout(() => navigate('/'), 100);
    }
  };

  const handleSaveConfirm = () => {
    if (formRef.current) {
      // Trigger the form submission
      const event = new Event('submit', { cancelable: true, bubbles: true });
      formRef.current.dispatchEvent(event);
    }
    setShowSaveDialog(false);

    // Add exit animation similar to the entry-view
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
      containerRef.current.style.transform = 'translateX(-20px)';
      containerRef.current.style.opacity = '0';
    }
  };

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
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