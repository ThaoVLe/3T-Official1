import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smile } from "lucide-react";

const feelings = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😍", label: "In love" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "😌", label: "Calm" },
  { emoji: "🥳", label: "Celebratory" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🤗", label: "Grateful" },
  { emoji: "😬", label: "Nervous" },
  { emoji: "🤒", label: "Sick" },
  { emoji: "😲", label: "Surprised" },
  { emoji: "😋", label: "Hungry" },
  { emoji: "🥱", label: "Bored" },
  { emoji: "😭", label: "Crying" },
];

const activities = [
  { emoji: "🍽️", label: "Eating" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "📚", label: "Reading" },
  { emoji: "🎧", label: "Listening" },
  { emoji: "🏃‍♂️", label: "Running" },
  { emoji: "🧘‍♀️", label: "Meditating" },
  { emoji: "💻", label: "Working" },
  { emoji: "🎬", label: "Watching" },
  { emoji: "✈️", label: "Traveling" },
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

  const filteredFeelings = feelings.filter(feeling => 
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

  // Initialize from selectedFeeling if it has combined emojis
  useEffect(() => {
    if (selectedFeeling && selectedFeeling.emoji.includes(" ")) {
      const [emotionEmoji, activityEmoji] = selectedFeeling.emoji.split(" ");
      const [emotionLabel, activityLabel] = selectedFeeling.label.split(", ");

      const emotion = feelings.find(f => f.emoji === emotionEmoji);
      const activity = activities.find(a => a.emoji === activityEmoji);

      if (emotion) setSelectedEmotion(emotion);
      if (activity) setSelectedActivity(activity);
    } else if (selectedFeeling) {
      const emotion = feelings.find(f => f.emoji === selectedFeeling.emoji);
      const activity = activities.find(a => a.emoji === selectedFeeling.emoji);

      if (emotion) setSelectedEmotion(emotion);
      if (activity) setSelectedActivity(activity);
    }
  }, [selectedFeeling]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-2 gap-1 text-muted-foreground font-normal w-full justify-start"
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
            <>
              <Smile className="h-4 w-4 mr-1" />
              <span>How are you feeling today?</span>
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>How are you feeling?</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Input
            type="text"
            placeholder="Search feelings..."
            className="mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Tabs defaultValue="emotion">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="emotion">Emotion</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="emotion">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {filteredFeelings.map((feeling) => (
                  <Button
                    key={feeling.emoji}
                    variant={selectedEmotion?.emoji === feeling.emoji ? "default" : "outline"}
                    className="h-16 flex flex-col items-center justify-center gap-1 p-2"
                    onClick={() => handleSelectEmotion(feeling)}
                  >
                    <span className="text-xl">{feeling.emoji}</span>
                    <span className="text-xs">{feeling.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {filteredActivities.map((activity) => (
                  <Button
                    key={activity.emoji}
                    variant={selectedActivity?.emoji === activity.emoji ? "default" : "outline"}
                    className="h-16 flex flex-col items-center justify-center gap-1 p-2"
                    onClick={() => handleSelectActivity(activity)}
                  >
                    <span className="text-xl">{activity.emoji}</span>
                    <span className="text-xs">{activity.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

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

          <div className="mt-4 flex justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}