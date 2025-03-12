import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import TipTapEditor from "@/components/tiptap-editor";
import { PageTransition } from "@/components/animations";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { X, Save } from "lucide-react";
import { useRouter } from "@/hooks/use-router";

export default function NewEntryPage() {
  const { userEmail } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCancel = () => {
    navigate("/diary");
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

    if (!userEmail) {
      toast({
        title: "Error",
        description: "You need to be logged in to save an entry",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log("Submitting new entry:", { userEmail, content });
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userEmail, 
          content,
          date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from server:", errorData);
        throw new Error(errorData.message || "Failed to save entry");
      }

      console.log("Entry saved successfully");
      toast({
        title: "Success",
        description: "Diary entry saved successfully",
      });
      navigate("/diary");
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null ? (error as Error).message : "Failed to save diary entry",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition direction={1}>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold ml-2">New Entry</h1>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="bg-primary hover:bg-primary/90"
              type="button"
            >
              {isSaving ? "Saving..." : "Save"}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <TipTapEditor 
            content={content} 
            onChange={setContent} 
            placeholder="What's on your mind today?"
          />
        </div>
      </div>
    </PageTransition>
  );
}