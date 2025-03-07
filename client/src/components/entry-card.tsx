
import { formatDate } from "@/lib/utils";
import { EntryWithMedia } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon } from "@/components/icons/edit-icon";

interface EntryCardProps {
  entry: EntryWithMedia;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  selectedImageId?: string;
}

export function EntryCard({ entry, onDelete, onEdit, selectedImageId }: EntryCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const handleViewEntry = () => {
    navigate(`/entry/${entry.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(entry.id);
    }
  };

  const handleImageClick = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    navigate(`/entry/${entry.id}?imageId=${mediaId}`);
  };

  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewEntry}
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{entry.title || "Untitled Entry"}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(entry.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="h-8 w-8"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8"
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {entry.content && (
          <div
            className="text-sm line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: entry.content.replace(/<img[^>]*>/g, ""),
            }}
          />
        )}

        {entry.media && entry.media.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {entry.media.slice(0, 4).map((media) => (
              <div
                key={media.id}
                className="relative"
                onClick={(e) => handleImageClick(e, media.id)}
              >
                <img
                  ref={(el) => (imageRefs.current[media.id] = el)}
                  src={media.url}
                  alt=""
                  className="w-24 h-24 object-cover rounded-md"
                  loading="lazy"
                />
              </div>
            ))}
            {entry.media.length > 4 && (
              <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">
                  +{entry.media.length - 4} more
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 h-8"
          onClick={handleViewEntry}
        >
          View
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
