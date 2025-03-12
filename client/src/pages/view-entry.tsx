import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEntry } from '../shared/api/entries';
import type { JournalEntry } from '@shared/types/schema';
import { formatDate } from '@shared/utils/date';
import { Button } from '../components/ui/button';
import { PageTransition } from '../components/page-transition';
import { Edit, ArrowLeft, MapPin } from 'lucide-react';

export default function ViewEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    async function fetchEntry() {
      try {
        setLoading(true);
        const data = await getEntry(id);
        setEntry(data);
      } catch (err) {
        console.error('Failed to fetch entry:', err);
        setError('Failed to load journal entry');
      } finally {
        setLoading(false);
      }
    }

    fetchEntry();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (error || !entry) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Entry not found'}
        </div>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go back to home
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to entries
            </Button>
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{entry.title}</h1>
          <Link to={`/entries/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
        
        <div className="mb-6 flex items-center text-gray-500">
          <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
          
          {entry.location && (
            <div className="flex items-center ml-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{entry.location}</span>
            </div>
          )}
        </div>
        
        <div className="prose max-w-none">
          {entry.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        {entry.media && entry.media.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Media</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {entry.media.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`Entry media ${index + 1}`} 
                  className="rounded-lg object-cover w-full h-48"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}