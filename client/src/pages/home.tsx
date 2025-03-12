import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, cardVariants } from "@/components/animations";

export default function Home() {
  const userEmail = localStorage.getItem("userEmail");

  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries", userEmail],
    queryFn: async () => {
      const response = await fetch(`/api/entries?email=${encodeURIComponent(userEmail!)}`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    const storeScrollPosition = () => {
      const container = document.querySelector('.diary-content');
      if (container) {
        sessionStorage.setItem('homeScrollPosition', String(container.scrollTop));
      }
    };

    window.addEventListener('visibilitychange', storeScrollPosition);
    window.addEventListener('beforeunload', storeScrollPosition);

    return () => {
      storeScrollPosition(); 
      window.removeEventListener('visibilitychange', storeScrollPosition);
      window.removeEventListener('beforeunload', storeScrollPosition);
    };
  }, []);

  useEffect(() => {
    if (!entries || entries.length === 0 || scrollRestoredRef.current) return;

    const restoreScroll = () => {
      const lastViewedEntryId = sessionStorage.getItem('lastViewedEntryId');
      const container = document.querySelector('.diary-content');

      if (container) {
        if (lastViewedEntryId) {
          const entryElement = document.getElementById(`entry-${lastViewedEntryId}`);
          if (entryElement) {
            container.scrollTop = 0;
            entryElement.scrollIntoView({ behavior: 'instant', block: 'center' });
            scrollRestoredRef.current = true;
            return;
          }
        }

        const savedPosition = sessionStorage.getItem('homeScrollPosition');
        if (savedPosition) {
          container.scrollTop = parseInt(savedPosition);
          scrollRestoredRef.current = true;
        }
      }
    };

    setTimeout(restoreScroll, 50);
  }, [entries]);

  useEffect(() => {
    return () => {
      scrollRestoredRef.current = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State for filters
  const [filters, setFilters] = useState({
    feeling: "",
    location: "",
    tag: "",
    startDate: "",
    endDate: ""
  });
  
  // Function to apply filters
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      // Build query string from non-empty filters
      const queryParams = new URLSearchParams();
      queryParams.append("email", user.email);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/entries?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      feeling: "",
      location: "",
      tag: "",
      startDate: "",
      endDate: ""
    });
    fetchEntries(); // Fetch all entries without filters
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Add filter UI component
  const FilterPanel = () => (
    <div className="bg-card p-4 mb-4 rounded-lg">
      <h3 className="font-semibold mb-2">Filter Entries</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Feeling</label>
          <select 
            className="w-full p-2 bg-background border rounded"
            value={filters.feeling}
            onChange={(e) => setFilters({...filters, feeling: e.target.value})}
          >
            <option value="">Any feeling</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="excited">Excited</option>
            <option value="calm">Calm</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground">Location</label>
          <input 
            className="w-full p-2 bg-background border rounded"
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground">Tag</label>
          <input 
            className="w-full p-2 bg-background border rounded"
            placeholder="Filter by tag"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-sm text-muted-foreground">Start Date</label>
          <input 
            type="date"
            className="w-full p-2 bg-background border rounded"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground">End Date</label>
          <input 
            type="date"
            className="w-full p-2 bg-background border rounded"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-3 gap-2">
        <Button variant="outline" onClick={resetFilters}>Reset</Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  );

  if (!entries?.length) {
    return (
      <PageTransition direction={-1}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
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
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition direction={-1}>
      <div 
        ref={containerRef}
        className="min-h-screen bg-background overflow-auto diary-content"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex justify-between items-center px-4 py-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Diary
            </h1>
            <Link href="/new">
              <Button className="flex gap-2">
                <FileEdit className="w-4 h-4" />
                New Entry
              </Button>
            </Link>
          </div>
        </div>

        <FilterPanel />
        <AnimatePresence>
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                id={`entry-${entry.id}`}
                className="bg-card"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ delay: index * 0.05 }}
                whileHover="hover"
              >
                <EntryCard 
                  entry={entry} 
                  setSelectedEntryId={setSelectedEntryId} 
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}