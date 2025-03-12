
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import TipTapEditor from "@/components/tiptap-editor";
import { PageTransition } from "@/components/animations";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { X, Save } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function NewEntryPage() {
  const userEmail = localStorage.getItem("userEmail");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check for authentication
  if (!userEmail) {
    navigate("/");
    return null;
  }

  const handleCancel = () => {
    setIsExiting(true);
    setTimeout(() => navigate("/"), 100);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your diary entry",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userEmail, 
          content,
          title: "New Entry",
          date: new Date().toISOString(),
          feeling: null,
          location: null,
          tags: []
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save entry");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      
      toast({
        title: "Success",
        description: "Entry saved successfully",
      });
      
      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition direction={1}>
      <div className={`flex flex-col h-screen bg-background ${isExiting ? 'pointer-events-none' : ''}`}>
        <div className="relative px-4 sm:px-6 py-3 border-b border-border bg-card sticky top-0 z-10">
          <div className="absolute top-3 right-4 sm:right-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="whitespace-nowrap"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="max-w-full sm:max-w-2xl pr-24">
            <h1 className="text-xl font-semibold">New Entry</h1>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-full sm:max-w-2xl mx-auto">
            <TipTapEditor 
              onChange={setContent} 
              content={content}
              placeholder="Write your thoughts..."
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
