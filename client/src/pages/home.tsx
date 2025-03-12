import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const { toast } = useToast();

  console.log("Home page rendering");

  useEffect(() => {
    // Check auth state
    console.log("Checking auth state");
    if (!auth.currentUser) {
      console.log("No authenticated user, redirecting to auth");
      navigate("/auth");
      return;
    }
  }, [navigate]);

  const { data: entries, isLoading, error } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
    enabled: !!auth.currentUser,
  });

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Basic content render
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Journal</h1>
          <div className="flex gap-4">
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Button onClick={() => navigate("/new")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading entries</div>
          ) : !entries || entries.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">No entries yet</h2>
              <p className="text-muted-foreground mb-8">
                Start writing your first journal entry
              </p>
              <Button onClick={() => navigate("/new")} size="lg">
                <PlusCircle className="h-5 w-5 mr-2" />
                Create First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <EntryCard 
                  key={entry.id}
                  entry={entry} 
                  setSelectedEntryId={setSelectedEntryId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}