import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, MapPin } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";

interface EntryCardProps {
  entry: DiaryEntry;
  onClick: () => void;
  onEdit: () => void;
}

export default function EntryCard({ entry, onClick, onEdit }: EntryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getPreviewText = (content: string) => {
    // Strip HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>?/gm, '');

    // Truncate to 120 characters
    return plainText.length > 120
      ? plainText.substring(0, 120) + '...'
      : plainText;
  };

  return (
    <Card className="h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 flex-none" onClick={onClick}>
        <CardTitle className="text-lg font-semibold line-clamp-1">{entry.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex-grow" onClick={onClick}>
        <div className="text-xs text-muted-foreground mb-2 flex items-center">
          <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>

          {entry.location && (
            <div className="flex items-center ml-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[120px]">{entry.location}</span>
            </div>
          )}
        </div>
        <p className="text-sm line-clamp-3">{getPreviewText(entry.content)}</p>
      </CardContent>
      <CardFooter className="pt-0 flex-none justify-end">
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }} className="h-8 px-2">
          <Edit className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Edit</span>
        </Button>
      </CardFooter>
    </Card>
  );
}