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

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      // If swiped from left to right (distance > 50px, time < 300ms, not too much vertical movement)
      if (swipeDistance > 50 && swipeTime < 300 && verticalDistance < 30) {
        setShowSaveDialog(true);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
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
      setTimeout(() => navigate(`/entry/${entry.id}`), 100);
    } else {
      setIsExiting(true);
      setTimeout(() => navigate('/'), 100);
    }
  };

  return (
    <>
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

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
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