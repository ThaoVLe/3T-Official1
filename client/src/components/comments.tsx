import { useState } from 'react';
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Comment } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Send, Trash2 } from "lucide-react";

interface CommentsProps {
  entryId: number;
  onCommentCountChange?: (count: number) => void;
}

export function Comments({ entryId, onCommentCountChange }: CommentsProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/entries/${entryId}/comments`],
    onSuccess: (data) => {
      if (onCommentCountChange) {
        onCommentCountChange(data.length);
      }
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/entries/${entryId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/comments`] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/entries/${entryId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/comments`] });
      toast({
        title: "Success",
        description: "Comment deleted",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment list */}
      <div className="space-y-3">
        {Array.isArray(comments) && comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2 group">
            <div className="flex-1 bg-muted rounded-lg p-3">
              <div className="text-sm">{comment.content}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteCommentMutation.mutate(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add comment form - Fixed at bottom */}
      <form 
        onSubmit={handleSubmit} 
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-2 flex items-center gap-2 z-50"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-muted"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!newComment.trim() || addCommentMutation.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}