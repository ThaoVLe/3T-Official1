import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import type { EntryWithoutUser } from '@/types';

interface EntryCardProps {
  entry: EntryWithoutUser;
  onEntryClick?: () => void;
}

export default function EntryCard({ entry, onEntryClick }: EntryCardProps) {
  const firstImageSrc = extractFirstImageSrc(entry.content);
  const textContent = stripHtmlTags(entry.content).trim();
  const truncatedText = textContent.length > 120 ? `${textContent.slice(0, 120)}...` : textContent;

  return (
    <Link 
      to={`/entries/${entry.id}`} 
      onClick={onEntryClick}
      className="block bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 mb-3"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">{entry.title || 'Untitled'}</h2>
          <span className="text-xs text-gray-500">{formatDate(new Date())}</span>
        </div>
        <div className="flex gap-3">
          <div className={`flex-1 ${firstImageSrc ? 'w-2/3' : 'w-full'}`}>
            <p className="text-sm text-gray-600 line-clamp-3">{truncatedText || 'No content'}</p>
          </div>
          {firstImageSrc && (
            <div className="w-1/3 h-16 flex-shrink-0">
              <img
                src={firstImageSrc}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Helper functions to extract content from HTML
function extractFirstImageSrc(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img.*?src=['"](.*?)['"]/i);
  return match ? match[1] : null;
}

function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}