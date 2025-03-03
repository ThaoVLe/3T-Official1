
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
          variant="outline" 
          className="h-9 flex items-center gap-2 px-3 border rounded-full bg-slate-50"
          aria-label="Select feeling"
        >
          {selectedFeeling ? (
            <>
              <span className="text-lg">{selectedFeeling.emoji}</span>
              <span className="text-sm font-medium">{selectedFeeling.label}</span>
            </>
          ) : (
            <>
              <SmileIcon className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-medium">How are you feeling?</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-center pb-1 border-b">How are you feeling today?</h4>
          <div className="grid grid-cols-4 gap-2">
            {feelings.map((feeling) => (
              <Button
                key={feeling.label}
                variant="ghost"
                className="h-16 p-1 flex flex-col items-center justify-center gap-1"
                onClick={() => onSelect(feeling)}
              >
                <span className="text-xl">{feeling.emoji}</span>
                <span className="text-xs">{feeling.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
