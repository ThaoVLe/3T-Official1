
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ImageIcon, X } from "lucide-react";

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
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Select feeling"
        >
          {selectedFeeling ? (
            <span className="text-xl">{selectedFeeling.emoji}</span>
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <X className="h-5 w-5" />
          <h4 className="font-medium text-center">How are you feeling?</h4>
          <div className="w-5"></div> {/* Spacer for alignment */}
        </div>
        
        <Tabs defaultValue="feelings">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="feelings">Feelings</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <div className="p-3">
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            
            <TabsContent value="feelings" className="m-0 p-0">
              <div className="grid grid-cols-2 gap-0">
                {filteredFeelings.map((feeling) => (
                  <Button
                    key={feeling.label}
                    variant="ghost"
                    className="flex items-center justify-start gap-2 p-3 h-14"
                    onClick={() => {
                      onSelect(feeling);
                    }}
                  >
                    <span className="text-xl">{feeling.emoji}</span>
                    <span className="text-sm">{feeling.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="activities" className="m-0 p-0">
              <div className="grid grid-cols-2 gap-0">
                {filteredActivities.map((activity) => (
                  <Button
                    key={activity.label}
                    variant="ghost"
                    className="flex items-center justify-start gap-2 p-3 h-14"
                    onClick={() => {
                      onSelect(activity);
                    }}
                  >
                    <span className="text-xl">{activity.emoji}</span>
                    <span className="text-sm">{activity.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
