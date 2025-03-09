import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X, Smile, Frown, Zap, Flame, Heart, Cloud, Bed, CloudLightning } from "lucide-react";
import { emotions, activities } from "@/data/feelings";

const feelingsData = [
  { icon: <Smile className="h-6 w-6" />, label: "Happy" },
  { icon: <Frown className="h-6 w-6" />, label: "Sad" },
  { icon: <Zap className="h-6 w-6" />, label: "Excited" },
  { icon: <Flame className="h-6 w-6" />, label: "Angry" },
  { icon: <Heart className="h-6 w-6" />, label: "Loved" },
  { icon: <Cloud className="h-6 w-6" />, label: "Calm" },
  { icon: <CloudLightning className="h-6 w-6" />, label: "Anxious" },
  { icon: <Bed className="h-6 w-6" />, label: "Tired" },
  { icon: <Smile className="h-6 w-6" />, label: "Blessed" },
  { icon: <Smile className="h-6 w-6" />, label: "Lovely" },
  { icon: <Smile className="h-6 w-6" />, label: "Thankful" },
  { icon: <Smile className="h-6 w-6" />, label: "Grateful" },
  { icon: <Smile className="h-6 w-6" />, label: "Blissful" },
  { icon: <Smile className="h-6 w-6" />, label: "Fantastic" },
  { icon: <Smile className="h-6 w-6" />, label: "Silly" },
  { icon: <Smile className="h-6 w-6" />, label: "Festive" },
  { icon: <Smile className="h-6 w-6" />, label: "Wonderful" },
  { icon: <Smile className="h-6 w-6" />, label: "Cool" },
  { icon: <Smile className="h-6 w-6" />, label: "Amused" },
  { icon: <Smile className="h-6 w-6" />, label: "Relaxed" },
  { icon: <Smile className="h-6 w-6" />, label: "Positive" },
  { icon: <Smile className="h-6 w-6" />, label: "Chill" },
];

const activitiesData = [
  { icon: <img src="/running.svg" alt="Running" className="h-6 w-6" />, label: "Running" },
  { icon: <img src="/cooking.svg" alt="Cooking" className="h-6 w-6" />, label: "Cooking" },
  { icon: <img src="/reading.svg" alt="Reading" className="h-6 w-6" />, label: "Reading" },
  { icon: <img src="/gaming.svg" alt="Gaming" className="h-6 w-6" />, label: "Gaming" },
  // ... other activities with icons
];

interface FeelingSelectorProps {
  onSelect: (feeling: { icon: React.ReactNode; label: string }) => void;
  selectedFeeling: { icon: React.ReactNode; label: string } | null;
}

export function FeelingSelector({ onSelect, selectedFeeling }: FeelingSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<{ icon: React.ReactNode; label: string } | null>(selectedFeeling);
  const [selectedActivity, setSelectedActivity] = useState<{ icon: React.ReactNode; label: string } | null>(null);
  const [customEmotion, setCustomEmotion] = useState('');
  const [customActivity, setCustomActivity] = useState('');

  const filteredFeelings = feelingsData.filter(feeling =>
    feeling.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activitiesData.filter(activity =>
    activity.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEmotion = (feeling: { icon: React.ReactNode; label: string }) => {
    setSelectedEmotion(feeling);
    if (selectedActivity) {
      const combined = {
        icon: <div className="flex gap-2">{feeling.icon} {selectedActivity.icon}</div>,
        label: `${feeling.label}, ${selectedActivity.label}`,
      };
      onSelect(combined);
    } else {
      onSelect(feeling);
    }
    setTimeout(() => setOpen(false), 300);
  };

  const handleSelectActivity = (activity: { icon: React.ReactNode; label: string }) => {
    setSelectedActivity(activity);
    if (selectedEmotion) {
      const combined = {
        icon: <div className="flex gap-2">{selectedEmotion.icon} {activity.icon}</div>,
        label: `${selectedEmotion.label}, ${activity.label}`
      };
      onSelect(combined);
    } else {
      onSelect(activity);
    }
    setTimeout(() => setOpen(false), 300);
  };

  const handleDone = () => {
    if (customEmotion) {
      const customFeeling = { icon: <Smile className="h-6 w-6" />, label: customEmotion }; // Placeholder icon
      handleSelectEmotion(customFeeling);
    }
    if (customActivity) {
      const customActivityObj = { icon: <img src="/placeholder.svg" alt="Custom Activity" className="h-6 w-6" />, label: customActivity }; // Placeholder icon
      handleSelectActivity(customActivityObj);
    }
    setOpen(false);
  };

  const hideKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const temporaryInput = document.createElement('input');
    temporaryInput.setAttribute('type', 'text');
    temporaryInput.style.position = 'absolute';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.fontSize = '16px';
    document.body.appendChild(temporaryInput);
    setTimeout(() => {
      temporaryInput.focus();
      setTimeout(() => {
        temporaryInput.blur();
        document.body.removeChild(temporaryInput);
      }, 50);
    }, 50);
    return new Promise(resolve => setTimeout(resolve, 100));
  };

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
            setTimeout(() => {
              tempInput.blur();
              document.body.removeChild(tempInput);
              setTimeout(() => {
                setOpen(true);
                if (selectedFeeling) {
                  if (selectedFeeling.label.includes(', ')) {
                    const parts = selectedFeeling.label.split(', ');
                    const icons = selectedFeeling.icon.props.children;

                    const emotion = feelingsData.find(f => f.label === parts[0]) || null;
                    const activity = activitiesData.find(a => a.label === parts[1]) || null;
                    setSelectedEmotion(emotion);
                    setSelectedActivity(activity);
                  } else {
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
            <div className="flex items-center">
              {selectedFeeling.icon}
            </div>
          ) : (
            <div className="flex items-center">
              <Smile className="h-6 w-6"/>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[100dvh] pt-6" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="mb-4">
          <div className="flex justify-center mt-2">
            {selectedEmotion && (
              <div className="inline-flex items-center gap-1 bg-muted p-1 px-2 rounded-md mr-2">
                {selectedEmotion.icon}
              </div>
            )}
            {selectedActivity && (
              <div className="inline-flex items-center gap-1 bg-muted p-1 px-2 rounded-md">
                {selectedActivity.icon}
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
            <h3 className="text-sm font-medium px-2 mb-2">Suggested Feelings</h3>
            <div className="grid grid-cols-3 gap-1">
              {feelingsData.map((feeling) => (
                <Button
                  key={feeling.label}
                  variant={selectedEmotion?.label === feeling.label ? "default" : "ghost"}
                  className="flex items-center justify-center gap-2 p-3 h-14"
                  onClick={() => handleSelectEmotion(feeling)}
                >
                  {feeling.icon}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="activities" className="m-0 p-0 overflow-y-auto flex-1 overflow-x-hidden">
            <div className="grid grid-cols-3 gap-1 w-full">
              {filteredActivities.map((activity) => (
                <Button
                  key={activity.label}
                  variant={selectedActivity?.label === activity.label ? "default" : "ghost"}
                  className="flex items-center justify-center gap-2 p-3 h-14"
                  onClick={() => handleSelectActivity(activity)}
                >
                  {activity.icon}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}