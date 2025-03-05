import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { feelings, activities } from "@/data/feelings";

const feelingsData = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😇", label: "Blessed" },
  { emoji: "😍", label: "Loved" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😋", label: "Lovely" },
  { emoji: "😃", label: "Thankful" },
  { emoji: "😄", label: "Excited" },
  { emoji: "😘", label: "In love" },
  { emoji: "🤪", label: "Crazy" },
  { emoji: "😁", label: "Grateful" },
  { emoji: "😌", label: "Blissful" },
  { emoji: "🤩", label: "Fantastic" },
  { emoji: "🙃", label: "Silly" },
  { emoji: "🎉", label: "Festive" },
  { emoji: "😀", label: "Wonderful" },
  { emoji: "😎", label: "Cool" },
  { emoji: "😏", label: "Amused" },
  { emoji: "😴", label: "Relaxed" },
  { emoji: "😊", label: "Positive" },
  { emoji: "😌", label: "Chill" },
];

const activitiesData = [
  { emoji: "🏃", label: "Running" },
  { emoji: "🍽️", label: "Eating" },
  { emoji: "📚", label: "Reading" },
  { emoji: "💤", label: "Sleeping" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🎧", label: "Listening" },
  { emoji: "✈️", label: "Traveling" },
  { emoji: "🎬", label: "Watching" },
];

interface FeelingSelectorProps {
  onSelect: (feeling: { emoji: string; label: string }) => void;
  selectedFeeling: { emoji: string; label: string } | null;
}

export function FeelingSelector({ onSelect, selectedFeeling }: FeelingSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<{ emoji: string; label: string } | null>(selectedFeeling);
  const [selectedActivity, setSelectedActivity] = useState<{ emoji: string; label: string } | null>(null);

  const filteredFeelings = feelingsData.filter(feeling =>
    feeling.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activitiesData.filter(activity =>
    activity.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEmotion = (feeling: { emoji: string; label: string }) => {
    setSelectedEmotion(feeling);

    // If we already have an activity, combine them
    if (selectedActivity) {
      const combined = {
        emoji: `${feeling.emoji} ${selectedActivity.emoji}`,
        label: `${feeling.label}, ${selectedActivity.label}`,
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

  const handleDone = () => {
    setOpen(false);
  };

  // Improved keyboard hiding for mobile
  const hideKeyboard = () => {
    // Force any active element to lose focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // iOS specific fix - create and remove an input to force keyboard dismissal
    const temporaryInput = document.createElement('input');
    temporaryInput.setAttribute('type', 'text');
    temporaryInput.style.position = 'absolute';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.fontSize = '16px'; // iOS won't zoom in on inputs with font size >= 16px

    document.body.appendChild(temporaryInput);

    // Adding timeout to ensure focus happens after DOM update
    setTimeout(() => {
      temporaryInput.focus();
      setTimeout(() => {
        temporaryInput.blur();
        document.body.removeChild(temporaryInput);
      }, 50);
    }, 50);

    // Return a promise to allow awaiting keyboard dismissal
    return new Promise(resolve => setTimeout(resolve, 100));
  };

  // Handle sheet open state change
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // For programmatic sheet opening, we'll handle keyboard dismissal
      // in the button click handler instead for more direct control
      setOpen(true);

      // Additional safety measure: ensure any active text input loses focus
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
          onClick={(e) => {
            e.preventDefault();

            // Aggressive keyboard dismissal on button click
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }

            // Create an invisible input field, focus and blur it to force keyboard dismissal
            const tempInput = document.createElement('input');
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            tempInput.style.top = '-1000px';
            tempInput.style.left = '0';
            document.body.appendChild(tempInput);

            // Focus and immediately blur with a small delay
            tempInput.focus();

            // On iOS we need to wait before removing the element
            setTimeout(() => {
              tempInput.blur();
              document.body.removeChild(tempInput);

              // Now open the sheet after ensuring keyboard is dismissed
              setTimeout(() => {
                setOpen(true);

                // Set initial states from current selection
                if (selectedFeeling) {
                  // Check if it's a combined selection
                  if (selectedFeeling.label.includes(', ')) {
                    const parts = selectedFeeling.label.split(', ');
                    const emojis = selectedFeeling.emoji.split(' ');

                    // Find the matching feelings and activities
                    const emotion = feelingsData.find(f => f.label === parts[0]) || null;
                    const activity = activitiesData.find(a => a.label === parts[1]) || null;

                    setSelectedEmotion(emotion);
                    setSelectedActivity(activity);
                  } else {
                    // Check if it's an emotion or activity
                    const emotion = feelingsData.find(f => f.label === selectedFeeling.label);
                    const activity = activitiesData.find(a => a.label === selectedFeeling.label);

                    setSelectedEmotion(emotion || null);
                    setSelectedActivity(activity || null);
                  }
                }
              }, 50);
            }, 50);
          }}
        >
          {selectedFeeling ? (
            <div className="flex items-center gap-1.5">
              {selectedFeeling.emoji.includes(' ') ? (
                // Combined emotion and activity
                <>
                  <span className="text-sm font-medium">{selectedFeeling.label}</span>
                  <span className="text-xl">{selectedFeeling.emoji}</span>
                </>
              ) : (
                // Just emotion
                <>
                  <span className="text-sm font-medium">{selectedFeeling.label}</span>
                  <span className="text-xl">{selectedFeeling.emoji}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xl">😊</span>
              <span className="text-sm font-medium">Feeling</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[100dvh] pt-6" onOpenAutoFocus={(e) => {
        // Prevent default auto focus behavior to avoid keyboard popup
        e.preventDefault();
      }}>
        <SheetHeader className="mb-4">
          <SheetTitle className="text-center text-xl">How are you feeling today?</SheetTitle>
          <div className="flex justify-center mt-2">
            {selectedEmotion && (
              <div className="inline-flex items-center gap-1 bg-muted p-1 px-2 rounded-md mr-2">
                <span className="text-xs">{selectedEmotion.label}</span>
                <span>{selectedEmotion.emoji}</span>
              </div>
            )}
            {selectedActivity && (
              <div className="inline-flex items-center gap-1 bg-muted p-1 px-2 rounded-md">
                <span className="text-xs">{selectedActivity.label}</span>
                <span>{selectedActivity.emoji}</span>
              </div>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="feelings" className="h-[calc(100%-60px)] flex flex-col">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="feelings">Feelings</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <div className="px-2 mb-4">
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
              onFocus={(e) => {
                // If we need to allow search but want to prevent keyboard initially
                // we can add specific handling here if needed
              }}
            />
          </div>

          <TabsContent value="feelings" className="m-0 p-0 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-1">
              {filteredFeelings.map((feeling) => (
                <Button
                  key={feeling.label}
                  variant={selectedEmotion?.label === feeling.label ? "default" : "ghost"}
                  className="flex items-center justify-start gap-2 p-3 h-14"
                  onClick={() => handleSelectEmotion(feeling)}
                >
                  <span className="text-xl">{feeling.emoji}</span>
                  <span className="text-sm">{feeling.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="activities" className="m-0 p-0 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-1">
              {filteredActivities.map((activity) => (
                <Button
                  key={activity.label}
                  variant={selectedActivity?.label === activity.label ? "default" : "ghost"}
                  className="flex items-center justify-start gap-2 p-3 h-14"
                  onClick={() => handleSelectActivity(activity)}
                >
                  <span className="text-xl">{activity.emoji}</span>
                  <span className="text-sm">{activity.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <Button
            onClick={handleDone}
            className="w-1/2 bg-primary text-primary-foreground"
            disabled={!selectedEmotion && !selectedActivity}
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}