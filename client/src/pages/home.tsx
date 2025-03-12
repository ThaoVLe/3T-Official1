import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, cardVariants } from "@/components/animations";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is authenticated
  if (!auth.currentUser) {
    console.log("No authenticated user, redirecting to auth page");
    navigate("/auth");
    return null;
  }

  const { data: entries, isLoading, error } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
    enabled: !!auth.currentUser,
  });

  console.log("Home page render:", { 
    hasUser: !!auth.currentUser, 
    isLoading, 
    hasEntries: !!entries,
    error 
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-500">Error loading entries</h2>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
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

          {(!entries || entries.length === 0) ? (
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
            <AnimatePresence>
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ delay: index * 0.1 }}
                  >
                    <EntryCard 
                      entry={entry} 
                      setSelectedEntryId={setSelectedEntryId}
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