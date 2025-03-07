
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Trash } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Entry, Media } from "@/shared/schema";
import { useToast } from "@/hooks/use-toast";
import { EditIcon } from "@/components/icons/edit-icon";

interface EntryWithMedia extends Entry {
  media: Media[];
}

export function EntryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entry, setEntry] = useState<EntryWithMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedImageId = searchParams.get("imageId");
  const selectedImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/entries/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch entry");
        }
        const data = await response.json();
        setEntry(data);
      } catch (error) {
        console.error("Error fetching entry:", error);
        toast({
          title: "Error",
          description: "Failed to load entry",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEntry();
    }
  }, [id, toast]);

  useEffect(() => {
    if (selectedImageId && selectedImageRef.current) {
      selectedImageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedImageId, entry]);

  const handleEdit = () => {
    if (entry) {
      navigate(`/edit/${entry.id}`);
    }
  };

  const handleDelete = async () => {
    if (!entry || deleting) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      navigate("/");
      toast({
        title: "Entry deleted",
        description: "Your entry has been permanently deleted",
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Entry not found</h1>
          <p className="text-muted-foreground">
            The entry you're looking for doesn't exist or was deleted
          </p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b">
        <div className="flex items-center gap-2 h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold truncate max-w-[75%]">
            {entry.title || "Untitled Entry"}
          </h1>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-56px)]">
        <div className="container px-4 py-6 diary-content">
          <div className="space-y-4">

            <div className="text-sm text-muted-foreground">
              {formatDate(entry.createdAt)}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleEdit}
              >
                <EditIcon className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </div>

            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.content || "" }}
            />

            {entry.media && entry.media.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Media</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {entry.media.map((media) => (
                    <div
                      key={media.id}
                      className="rounded-lg overflow-hidden border"
                    >
                      <img
                        ref={media.id === selectedImageId ? selectedImageRef : null}
                        src={media.url}
                        alt=""
                        className="w-full object-cover aspect-video"
                        id={`image-${media.id}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
