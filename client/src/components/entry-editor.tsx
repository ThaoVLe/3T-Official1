import React, { useState } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Entry {
  title: string;
  content: string;
  feeling: { emoji: string; label: string } | null;
  location: string | null;
  // other fields
}

interface EntryEditorProps {
  entry?: Entry;
  onSubmit: (entry: Entry) => void;
}

const EntryEditor: React.FC<EntryEditorProps> = ({ entry, onSubmit }) => {
  const [title, setTitle] = useState<string>(entry?.title || "");
  const [content, setContent] = useState<string>(entry?.content || "");
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(
    entry?.feeling ? entry.feeling : null
  );
  const [location, setLocation] = useState<string | null>(
    entry?.location || null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      content,
      feeling,
      location,
    };
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar p-4">
          <div>
            <Input 
              type="text" 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry Title"
              className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0"
            />
          </div>
          <div>
            <textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[200px] p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What's on your mind?"
            />
          </div>
          <div className="flex items-center space-x-4">
            <FeelingSelector onSelect={setFeeling} selectedFeeling={feeling} />
            <LocationSelector onSelect={setLocation} selectedLocation={location} />
          </div>
        </div>
        <div className="flex-none border-t p-4 bg-white">
          <Button type="submit" className="w-full">Save Entry</Button>
        </div>
      </form>
    </div>
  );
};

export default EntryEditor;