import { useState } from "react";
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";

interface EntryFormData {
  feeling: { emoji: string; label: string } | null;
  location: string | null;
}

export default function NewEntryForm() {
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(
    null
  );
  const [location, setLocation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData: EntryFormData = { feeling, location };

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Entry created successfully!");
      // Reset form state here, if needed.
    } catch (error) {
      console.error("Error creating entry:", error);
      // Handle error appropriately (e.g., display error message to the user).
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-2 items-center">
        <FeelingSelector
          onSelect={setFeeling}
          selectedFeeling={feeling}
        />
        <LocationSelector
          onSelect={setLocation}
          selectedLocation={location}
        />
      </div>
      <button type="submit">Create Entry</button>
    </form>
  );
}