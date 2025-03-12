import * as React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LogOut } from "lucide-react";

type DiaryEntry = {
  id: number;
  content: string;
  createdAt: string;
};

export default function DiaryPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [entries, setEntries] = React.useState<DiaryEntry[]>([]);
  const [newEntry, setNewEntry] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const userEmail = localStorage.getItem("userEmail");

  // Redirect if not logged in
  React.useEffect(() => {
    if (!userEmail) {
      navigate("/auth");
    }
  }, [userEmail, navigate]);

  // Fetch entries
  React.useEffect(() => {
    if (!userEmail) return;

    const fetchEntries = async () => {
      try {
        const response = await fetch(`/api/entries?email=${userEmail}`);
        if (!response.ok) throw new Error("Failed to fetch entries");
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load diary entries",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [userEmail, toast]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim() || !userEmail) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          content: newEntry,
        }),
      });

      if (!response.ok) throw new Error("Failed to save entry");

      const savedEntry = await response.json();
      setEntries([savedEntry, ...entries]);
      setNewEntry("");
      toast({
        title: "Success",
        description: "Diary entry saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save diary entry",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Diary</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-4 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Write your diary entry..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[100px]"
              disabled={isSaving}
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <p className="whitespace-pre-wrap">{entry.content}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
            </Card>
          ))}
          {entries.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No diary entries yet. Start writing your first entry above!
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
