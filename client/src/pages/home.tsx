import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit, LogOut } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations";
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

  return (
    <PageTransition>
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">My Journal</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/new")} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Entry</span>
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-24 w-full mb-2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load journal entries. Please try again later.</span>
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layoutId={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <EntryCard 
                    entry={entry} 
                    onClick={() => navigate(`/view/${entry.id}`)} 
                    onEdit={() => navigate(`/edit/${entry.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-medium mb-2">No journal entries yet</h2>
            <p className="text-gray-500 mb-6">Start writing your first journal entry</p>
            <Button onClick={() => navigate("/new")} className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Create your first entry
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}