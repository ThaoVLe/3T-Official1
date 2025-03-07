import React, { useState } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { X, Save } from "lucide-react";

interface Entry {
  feeling: { emoji: string; label: string } | null;
  location: string | null;
  title: string;
  content: string;
  createdAt: Date;
}

const EditEntry: React.FC<{ entry: Entry; onSave: (entry: Entry) => void }> = ({ entry, onSave }) => {
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(
    entry?.feeling
  );
  const [location, setLocation] = useState<string | null>(
    entry?.location || null
  );
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...entry, feeling, location, title, content });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Simplified Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b flex-none">
        <div className="relative px-4 py-3">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:bg-muted/10"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
          <div className="pr-24">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0"
              placeholder="What's on your mind?"
            />
            {/* Facebook-style timestamp */}
            <div className="text-sm text-muted-foreground/80 mt-1 font-medium">
              {format(entry?.createdAt || new Date(), "MMMM d 'at' h:mm a")}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        <div className="p-4">
          {/* Facebook-style mood and location pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(feeling || location) && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {feeling && (
                  <div className="flex items-center gap-1 bg-muted/30 rounded-full px-3 py-1.5">
                    <span className="text-muted-foreground">feeling</span>
                    <span className="font-medium">{feeling.label}</span>
                    <span>{feeling.emoji}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-1 bg-muted/30 rounded-full px-3 py-1.5">
                    <span className="text-muted-foreground">at</span>
                    <span className="font-medium">{location}</span>
                    <span>📍</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Facebook-style content editor */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[200px] p-4 text-base leading-relaxed border-0 focus:ring-0 resize-none focus:outline-none"
              placeholder="Write something..."
              style={{
                height: 'auto',
                minHeight: '200px',
                overflowY: 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEntry;