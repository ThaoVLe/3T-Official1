import * as React from "react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emotions, activities } from "@/data/feelings";

interface FeelingSelectorProps {
  onSelect: (feeling: { emoji: string; label: string }) => void;
  selectedFeeling: { emoji: string; label: string } | null;
}

export function FeelingSelector({ onSelect, selectedFeeling }: FeelingSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<{ emoji: string; label: string } | null>(selectedFeeling);
  const [selectedActivity, setSelectedActivity] = useState<{ emoji: string; label: string } | null>(null);

  const filteredEmotions = emotions.filter(feeling =>
    feeling.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter(activity =>
    activity.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEmotion = (feeling: { emoji: string; label: string }) => {
    setSelectedEmotion(feeling);

    // If we already have an activity, combine them
    if (selectedActivity) {
      const combined = {
        emoji: `${feeling.emoji} ${selectedActivity.emoji}`,
        label: `${feeling.label}, ${selectedActivity.label}`
      };
      onSelect(combined);
    } else {
      onSelect(feeling);
    }
  };

  const handleSelectActivity = (activity: { emoji: string; label: string }) => {
    setSelectedActivity(activity);

    // If we already have an emotion, combine them
    if (selectedEmotion) {
      const combined = {
        emoji: `${selectedEmotion.emoji} ${activity.emoji}`,
        label: `${selectedEmotion.label}, ${activity.label}`
      };
      onSelect(combined);
    } else {
      onSelect(activity);
    }
  };

  // Simulate delay for keyboard dismissal (simplified from original)
  const simulateDelay = async () => {
    return new Promise(resolve => setTimeout(resolve, 100));
  };

  // Handle sheet open state change
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(true);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 px-3 rounded-full flex items-center"
          aria-label="Select feeling"
          onClick={async (e) => {
            e.preventDefault();
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            const tempInput = document.createElement('input');
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            tempInput.style.top = '-1000px';
            tempInput.style.left = '0';
            document.body.appendChild(tempInput);
            tempInput.focus();
            tempInput.blur();
            setTimeout(() => {
              document.body.removeChild(tempInput);
              setOpen(true);
            }, 100);
          }}
        >
          {selectedFeeling ? (
            <div className="flex items-center">
              <span className="mr-2">{selectedFeeling.emoji}</span>
              <span className="text-sm font-medium">{selectedFeeling.label}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-sm font-medium">Add feeling</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-3/4 rounded-t-xl">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Input
              type="text"
              placeholder="Search feelings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {/* Emotions section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">How are you feeling?</h3>
              <div className="grid grid-cols-4 gap-2">
                {filteredEmotions.map((emotion) => (
                  <Button
                    key={emotion.label}
                    variant="outline"
                    className={`flex flex-col items-center justify-center h-20 ${
                      selectedEmotion?.label === emotion.label ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectEmotion(emotion)}
                  >
                    <span className="text-2xl mb-1">{emotion.emoji}</span>
                    <span className="text-xs text-center">{emotion.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Activities section */}
            <div>
              <h3 className="text-sm font-semibold mb-2">What are you doing?</h3>
              <div className="grid grid-cols-4 gap-2">
                {filteredActivities.map((activity) => (
                  <Button
                    key={activity.label}
                    variant="outline"
                    className={`flex flex-col items-center justify-center h-20 ${
                      selectedActivity?.label === activity.label ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectActivity(activity)}
                  >
                    <span className="text-2xl mb-1">{activity.emoji}</span>
                    <span className="text-xs text-center">{activity.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}