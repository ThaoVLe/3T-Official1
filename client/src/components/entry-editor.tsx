import React, { useState } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/lib/settings";
import { Lock } from "lucide-react";

interface Entry {
  title: string;
  content: string;
  feeling: { emoji: string; label: string } | null;
  location: string | null;
  sensitive: boolean;
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
  const [sensitive, setSensitive] = useState<boolean>(entry?.sensitive || false);
  const settings = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      content,
      feeling,
      location,
      sensitive,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="flex items-center space-x-2">
        <FeelingSelector onSelect={setFeeling} selectedFeeling={feeling} />
        <LocationSelector onSelect={setLocation} selectedLocation={location} />
      </div>
      {settings.isPasswordProtectionEnabled && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="sensitive" className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>Mark as sensitive entry</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              This entry will be password protected
            </p>
          </div>
          <Switch
            id="sensitive"
            checked={sensitive}
            onCheckedChange={setSensitive}
          />
        </div>
      )}
      <button type="submit">Submit</button>
    </form>
  );
};

export default EntryEditor;