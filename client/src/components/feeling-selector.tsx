import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X } from "lucide-react";

const feelings = [
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

const activities = [
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

  const filteredFeelings = feelings.filter(feeling => 
    feeling.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter(activity => 
    activity.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (feeling: { emoji: string; label: string }) => {
    onSelect(feeling);
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
  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen) {
      // Ensure keyboard is fully dismissed before opening the sheet
      await hideKeyboard();

      // Short delay before opening sheet to ensure keyboard is gone
      setTimeout(() => {
        setOpen(true);
      }, 50);
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
            hideKeyboard();
            setOpen(true);
          }}
        >
          {selectedFeeling ? (
            <span className="text-xl">{selectedFeeling.emoji}</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xl">😊</span>
              <span className="text-sm font-medium">Feeling</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[100dvh] pt-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-center text-xl">How are you feeling today?</SheetTitle>
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
            />
          </div>

          <TabsContent value="feelings" className="m-0 p-0 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-1">
              {filteredFeelings.map((feeling) => (
                <Button
                  key={feeling.label}
                  variant="ghost"
                  className="flex items-center justify-start gap-2 p-3 h-14"
                  onClick={() => handleSelect(feeling)}
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
                  variant="ghost"
                  className="flex items-center justify-start gap-2 p-3 h-14"
                  onClick={() => handleSelect(activity)}
                >
                  <span className="text-xl">{activity.emoji}</span>
                  <span className="text-sm">{activity.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}