import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const { data: entries, isLoading, error } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
  });

  return (
    <PageTransition>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Journal</h1>
          <Button onClick={() => navigate("/new")} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            New Entry
          </Button>
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
                  layoutId={entry.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedEntryId(entry.id.toString())}
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