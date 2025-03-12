import React, { useState } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";

interface Entry {
  title: string;
  content: string;
  feeling: { emoji: string; label: string } | null;
  location: string | null;
  tags?: string[];
}

// Make sure the form submission includes all fields
const submitEntry = async (entry: Entry) => {
  // Include all metadata in the request
  try {
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...entry,
        userEmail: currentUser.email,
        // Convert feeling object to string format for storage
        feeling: entry.feeling ? JSON.stringify(entry.feeling) : null,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create entry');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating entry:', error);
    throw error;
  }
};

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
      <button type="submit">Submit</button>
    </form>
  );
};

export default EntryEditor;