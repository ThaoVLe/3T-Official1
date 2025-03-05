import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const feelingsData = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😌", label: "Relaxed" },
  { emoji: "🥰", label: "Loved" },
  { emoji: "😏", label: "Smug" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "😴", label: "Sleepy" },
  { emoji: "😳", label: "Surprised" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🤗", label: "Grateful" },
];

const activitiesData = [
  { emoji: "🏃‍♂️", label: "Running" },
  { emoji: "🍽️", label: "Eating" },
  { emoji: "📚", label: "Reading" },
  { emoji: "💻", label: "Working" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🎵", label: "Listening" },
  { emoji: "🧘‍♀️", label: "Meditating" },
  { emoji: "🎨", label: "Creating" },
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
  const [customEmotion, setCustomEmotion] = useState('');
  const [customActivity, setCustomActivity] = useState('');

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
        label: `${selectedEmotion.label}, ${activity.label}`,
      };
      onSelect(combined);
    } else {
      onSelect(activity);
    }
  };

  const handleCustomEmotion = () => {
    if (customEmotion.trim()) {
      const newEmotion = {
        emoji: "🌸", // Random flower emoji
        label: customEmotion.trim(),
      };
      handleSelectEmotion(newEmotion);
      setCustomEmotion('');
    }
  };

  const handleCustomActivity = () => {
    if (customActivity.trim()) {
      const newActivity = {
        emoji: "🔄",
        label: customActivity.trim(),
      };
      handleSelectActivity(newActivity);
      setCustomActivity('');
    }
  };

  const handleDone = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          onClick={(e) => {
            e.preventDefault();

            // Create a temporary input element to steal focus from any potential keyboard
            const tempInput = document.createElement('input');
            document.body.appendChild(tempInput);
            tempInput.focus();
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
                  const emotion = feelingsData.find(f => f.label === selectedFeeling.label) || null;
                  const activity = activitiesData.find(a => a.label === selectedFeeling.label) || null;

                  if (emotion) {
                    setSelectedEmotion(emotion);
                    setSelectedActivity(null);
                  } else if (activity) {
                    setSelectedEmotion(null);
                    setSelectedActivity(activity);
                  } else {
                    // It's custom
                    if (selectedFeeling.emoji === "🌸") {
                      setSelectedEmotion(selectedFeeling);
                      setSelectedActivity(null);
                    } else {
                      setSelectedEmotion(null);
                      setSelectedActivity(selectedFeeling);
                    }
                  }
                }
              }
            }, 50);
          }}
        >
          {selectedFeeling ? (
            <span className="flex items-center gap-1">
              <span className="text-xs">{selectedFeeling.label}</span>
              <span>{selectedFeeling.emoji}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="text-xs">Add feeling</span>
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] px-0">
        <SheetHeader className="mb-2 px-4 text-left">
          <SheetTitle>How are you feeling?</SheetTitle>
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedEmotion && (
              <div className="bg-muted text-muted-foreground px-2 py-1 rounded-md flex items-center gap-1">
                <span className="text-xs">{selectedEmotion.label}</span>
                <span>{selectedEmotion.emoji}</span>
              </div>
            )}
            {selectedActivity && (
              <div className="bg-muted text-muted-foreground px-2 py-1 rounded-md flex items-center gap-1">
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

          <TabsContent value="feelings" className="m-0 p-0 overflow-y-auto flex-1">
            <div className="px-2 mb-4">
              <Input
                placeholder="How are you feeling?"
                className="mb-2"
                id="customFeeling"
                value={customEmotion}
                onChange={(e) => setCustomEmotion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomEmotion();
                  }
                }}
              />
              <Button 
                onClick={handleCustomEmotion}
                size="sm"
                className="w-full"
              >
                Add Custom Feeling
              </Button>
            </div>

            {/* Default Feelings */}
            <h3 className="text-sm font-medium px-2 mb-2">Suggested Feelings</h3>
            <div className="grid grid-cols-3 gap-1">
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
            <div className="px-2 mb-4">
              <Input
                placeholder="What are you doing today?"
                className="mb-2"
                id="customActivity"
                value={customActivity}
                onChange={(e) => setCustomActivity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomActivity();
                  }
                }}
              />
              <Button 
                onClick={handleCustomActivity}
                size="sm"
                className="w-full"
              >
                Add Custom Activity
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-1">
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