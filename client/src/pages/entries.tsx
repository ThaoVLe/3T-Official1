
import { useQuery } from "@tanstack/react-query";
import { EntryCard } from "@/components/entry-card";
import { apiRequest } from "@/lib/apiClient";
import type { DiaryEntry } from "@shared/schema";

export default function Entries() {
  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['entries'],
    queryFn: () => apiRequest.get('/entries')
  });

  if (isLoading) return <div>Loading entries...</div>;
  if (error) return <div>Error loading entries: {String(error)}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Diary Entries</h1>
      
      {entries && entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry: DiaryEntry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={(entry) => {
                // Handle edit
                window.location.href = `/entry/${entry.id}`;
              }}
              onDelete={(id) => {
                // Handle delete (refresh is handled by the mutation)
                console.log("Entry deleted:", id);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="mb-4">No entries yet. Start by creating your first diary entry!</p>
          <a
            href="/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Create New Entry
          </a>
        </div>
      )}
    </div>
  );
}
