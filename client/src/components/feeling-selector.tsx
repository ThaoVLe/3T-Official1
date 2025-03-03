import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, Tab } from "@/components/ui/tabs"; // Assuming a Tabs component exists
import { Search } from "@/components/ui/search"; // Assuming a Search component exists


const feelings = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😮", label: "Surprised" },
  { emoji: "😌", label: "Relaxed" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "😍", label: "Loving" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🙃", label: "Silly" },
  { emoji: "😇", label: "Blessed" },
  { emoji: "😬", label: "Awkward" },
];

const activities = [ // Example activities
  { label: "Walk in the park" },
  { label: "Read a book" },
  { label: "Listen to music" },
];

interface FeelingSelectorProps {
  onSelect: (item: { emoji?: string; label: string }) => void;
  selectedFeeling: { emoji?: string; label: string } | null;
}

export function FeelingSelector({ onSelect, selectedFeeling }: FeelingSelectorProps) {
  const [activeTab, setActiveTab] = useState("feelings");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = activeTab === "feelings"
    ? feelings.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : activities.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 flex items-center gap-2 px-3 border rounded-full bg-slate-50"
          aria-label="Select feeling"
        >
          {selectedFeeling ? (
            <>
              {selectedFeeling.emoji && <span className="text-lg">{selectedFeeling.emoji}</span>}
              <span className="text-sm font-medium">{selectedFeeling.label}</span>
            </>
          ) : (
            <>
              {/* Replace with new icon */}
              <span className="text-sm font-medium">How are you feeling/doing?</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tab value="feelings" className="font-medium">Feelings</Tab>
          <Tab value="activities" className="font-medium">Activities</Tab>
        </Tabs>
        <Search value={searchQuery} onChange={setSearchQuery} placeholder="Search..." />
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-1 gap-2"> {/* Adjusted to single column */}
            {filteredItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="h-16 p-1 flex flex-col items-center justify-center gap-1"
                onClick={() => onSelect(item)}
              >
                {item.emoji && <span className="text-xl">{item.emoji}</span>}
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}