import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion"; // Added import

export default function Home() {
  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries"],
  });

  if (isLoading) {
    return (
      <motion.div 
        className="flex flex-col h-screen overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      > {/* Wrapped with motion.div */}
        <div className="sticky top-0 z-10 bg-white border-b flex-none">
          <div className="px-4 py-4">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f0f2f5]">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </motion.div> {/* Closed motion.div */}
    );
  }

  if (!entries?.length) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-screen text-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      > {/* Wrapped with motion.div */}
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome to Your Diary
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Start capturing your memories with text, photos, videos, and audio recordings.
        </p>
        <Link href="/new">
          <Button size="lg" className="flex gap-2">
            <PlusCircle className="w-5 h-5" />
            Create Your First Entry
          </Button>
        </Link>
      </motion.div> {/* Closed motion.div */}
    );
  }

  return (
    <motion.div 
      className="flex flex-col h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    > {/* Wrapped with motion.div */}
      <div className="sticky top-0 z-10 bg-white border-b flex-none">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            My Diary
          </h1>
          <Link href="/new">
            <Button className="flex gap-2">
              <PlusCircle className="w-4 h-4" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f0f2f5]">
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white">
              <EntryCard entry={entry} />
            </div>
          ))}
        </div>
      </div>
    </motion.div> {/* Closed motion.div */}
  );
}