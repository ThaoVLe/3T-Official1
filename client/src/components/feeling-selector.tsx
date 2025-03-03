
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  
  const filteredFeelings = feelings.filter(feeling => 
    feeling.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredActivities = activities.filter(activity => 
    activity.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-10 px-3 rounded-full flex items-center"
          aria-label="Select feeling"
          onClick={() => {
            // Dismiss keyboard when feeling selector is opened
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          {selectedFeeling ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{selectedFeeling.emoji}</span>
              <span className="text-sm font-medium">{selectedFeeling.label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xl">😊</span>
              <span className="text-sm font-medium">Feeling</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[100dvh] p-0 w-full max-w-none">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="text-center text-xl">How are you feeling today?</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="feelings" className="h-[calc(100%-60px)]">
          <TabsList className="w-full grid grid-cols-2 px-4 py-2">
            <TabsTrigger value="feelings">Feelings</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            
            <TabsContent value="feelings" className="m-0 p-0 h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {filteredFeelings.map((feeling) => (
                  <Button
                    key={feeling.label}
                    variant="outline"
                    className="flex items-center justify-start gap-2 p-4 h-16"
                    onClick={() => {
                      onSelect(feeling);
                      document.querySelector<HTMLButtonElement>("button[data-state='open']")?.click();
                    }}
                  >
                    <span className="text-2xl">{feeling.emoji}</span>
                    <span className="text-base">{feeling.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="activities" className="m-0 p-0 h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {filteredActivities.map((activity) => (
                  <Button
                    key={activity.label}
                    variant="outline"
                    className="flex items-center justify-start gap-2 p-4 h-16"
                    onClick={() => {
                      onSelect(activity);
                      document.querySelector<HTMLButtonElement>("button[data-state='open']")?.click();
                    }}
                  >
                    <span className="text-2xl">{activity.emoji}</span>
                    <span className="text-base">{activity.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
