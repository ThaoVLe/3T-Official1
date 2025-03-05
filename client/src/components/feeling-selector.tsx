
import * as React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SmilePlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emotions, activities } from "@/data/feelings";
import { cn } from "@/lib/utils";

interface FeelingData {
  emoji: string;
  label: string;
}

export function FeelingSelector({
  value,
  onSelect,
}: {
  value?: FeelingData | null;
  onSelect: (data: FeelingData) => void;
}) {
  const [selectedEmotion, setSelectedEmotion] = React.useState<FeelingData | null>(
    null
  );
  const [selectedActivity, setSelectedActivity] = React.useState<FeelingData | null>(
    null
  );
  const [selectedFeeling, setSelectedFeeling] = React.useState<FeelingData | null>(
    value || null
  );
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (feeling: FeelingData) => {
    if (selectedActivity) {
      const combined = {
        emoji: `${feeling.emoji} ${selectedActivity.emoji}`,
        label: `${feeling.label}, ${selectedActivity.label}`
      };
      onSelect(combined);
    } else {
      onSelect(feeling);
    }
    setSelectedEmotion(feeling);
    setSelectedFeeling(selectedActivity ? {
      emoji: `${feeling.emoji} ${selectedActivity.emoji}`,
      label: `${feeling.label}, ${selectedActivity.label}`
    } : feeling);
    
    // Close the keyboard when emotion is selected
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  };

  const handleSelectActivity = (activity: FeelingData) => {
    setSelectedActivity(activity);
    if (selectedEmotion) {
      const combined = {
        emoji: `${selectedEmotion.emoji} ${activity.emoji}`,
        label: `${selectedEmotion.label}, ${activity.label}`
      };
      setSelectedFeeling(combined);
      onSelect(combined);
    }
    
    // Close the keyboard when activity is selected
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  };

  React.useEffect(() => {
    if (value) {
      setSelectedFeeling(value);
      // Try to parse the combined emotion and activity
      if (value.emoji.includes(" ") && value.label.includes(",")) {
        const emojiParts = value.emoji.split(" ");
        const labelParts = value.label.split(",");
        if (emojiParts.length > 1 && labelParts.length > 1) {
          const emotionEmoji = emojiParts[0];
          const activityEmoji = emojiParts[1];
          const emotionLabel = labelParts[0].trim();
          const activityLabel = labelParts[1].trim();

          const emotion = emotions.find(
            (e) => e.emoji === emotionEmoji && e.label === emotionLabel
          );
          const activity = activities.find(
            (a) => a.emoji === activityEmoji && a.label === activityLabel
          );

          if (emotion) setSelectedEmotion(emotion);
          if (activity) setSelectedActivity(activity);
        }
      }
    }
  }, [value]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-auto py-1.5 px-2 text-xs"
          onClick={() => setIsOpen(true)}
        >
          {selectedFeeling ? (
            <div className="flex items-center gap-1.5">
              {selectedFeeling.emoji.includes(' ') ? (
                // Combined emotion and activity
                <>
                  <span className="text-sm font-medium">{selectedFeeling.label.split(',')[0]}</span>
                  <span className="text-xl">{selectedFeeling.emoji.split(' ')[0]}</span>
                  <span>,</span>
                  <span className="text-sm font-medium">{selectedFeeling.label.split(',')[1].trim()}</span>
                  <span className="text-xl">{selectedFeeling.emoji.split(' ')[1]}</span>
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
              <SmilePlusIcon className="w-4 h-4" />
              <span>How are you feeling?</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[400px] px-0">
        <Tabs defaultValue="emotions" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          <TabsContent value="emotions" className="p-4 pt-6">
            <div className="grid grid-cols-6 gap-3">
              {emotions.map((emotion) => (
                <Button
                  key={emotion.emoji}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center h-auto py-2 px-0",
                    selectedEmotion?.emoji === emotion.emoji &&
                      "border-primary/50 bg-primary/10"
                  )}
                  onClick={() => handleSelect(emotion)}
                >
                  <span className="text-2xl mb-1">{emotion.emoji}</span>
                  <span className="text-xs">{emotion.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="activities" className="p-4 pt-6">
            <div className="grid grid-cols-6 gap-3">
              {activities.map((activity) => (
                <Button
                  key={activity.emoji}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center h-auto py-2 px-0",
                    selectedActivity?.emoji === activity.emoji &&
                      "border-primary/50 bg-primary/10"
                  )}
                  onClick={() => handleSelectActivity(activity)}
                >
                  <span className="text-2xl mb-1">{activity.emoji}</span>
                  <span className="text-xs">{activity.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
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
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
