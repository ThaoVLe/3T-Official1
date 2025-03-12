import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut, FileEdit } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from localStorage
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    if (!email) {
      navigate("/auth");
    }
  }, [navigate]);

  const { data: allEntries, isLoading, error } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
    enabled: !!userEmail,
  });

  // Filter entries by the current user's email
  const entries = allEntries?.filter(entry => entry.userId === userEmail) || [];

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('userEmail');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex justify-between items-center px-4 py-3">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex justify-between items-center px-4 py-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Journal
            </h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button onClick={() => navigate("/new")} className="flex gap-2">
                <FileEdit className="w-4 h-4" />
                New Entry
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-destructive">Error loading entries</h2>
              <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
          ) : !entries?.length ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">No entries yet</h2>
              <p className="text-muted-foreground mb-8">
                Start capturing your memories with text, photos, and more.
              </p>
              <Button 
                size="lg" 
                className="flex gap-2"
                onClick={() => navigate("/new")}
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Entry
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4 max-w-4xl mx-auto">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EntryCard 
                      entry={entry}
                      onClick={() => navigate(`/entries/${entry.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
}