
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmileIcon } from "lucide-react";

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

interface FeelingSelectorProps {
  onSelect: (feeling: { emoji: string; label: string }) => void;
  selectedFeeling: { emoji: string; label: string } | null;
}

export function FeelingSelector({ onSelect, selectedFeeling }: FeelingSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-9 flex items-center gap-2 px-3"
          aria-label="Select feeling"
        >
          {selectedFeeling ? (
            <>
              <span className="text-lg">{selectedFeeling.emoji}</span>
              <span className="text-sm">{selectedFeeling.label}</span>
            </>
          ) : (
            <>
              <SmileIcon className="h-5 w-5" />
              <span className="text-sm">Mood</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">How are you feeling?</h4>
          <div className="grid grid-cols-6 gap-2">
            {feelings.map((feeling) => (
              <Button
                key={feeling.label}
                variant="ghost"
                className="h-9 w-9 p-0"
                onClick={() => onSelect(feeling)}
                title={feeling.label}
              >
                <span className="text-lg">{feeling.emoji}</span>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
