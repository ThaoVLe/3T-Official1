import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, FileEdit, LogOut } from "lucide-react";
import EntryCard from "@/components/entry-card";
import type { DiaryEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, cardVariants } from "@/components/animations";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const userEmail = localStorage.getItem("userEmail");

  const { data: entries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/entries", userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const response = await fetch(`/api/entries?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
    enabled: !!userEmail,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Login failed");

      const user = await response.json();
      localStorage.setItem("userEmail", user.email);
      window.location.reload(); // Reload to trigger new query
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    window.location.reload();
  };

  // Show login form if not logged in
  if (!userEmail) {
    return (
      <PageTransition direction={-1}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Welcome to Your Diary
            </h1>
            <p className="text-muted-foreground mb-8">
              Please log in with your email to access your diary.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn}
              />
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Continue with Email"}
              </Button>
            </form>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background overflow-auto diary-content">
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

  return (
    <PageTransition direction={-1}>
      <div className="min-h-screen bg-background overflow-auto diary-content">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex justify-between items-center px-4 py-3">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                My Diary
              </h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/new">
                <Button className="flex gap-2">
                  <FileEdit className="w-4 h-4" />
                  New Entry
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-6 max-w-2xl">
          {!entries?.length ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">No entries yet</h2>
              <p className="text-muted-foreground mb-4">
                Start writing your first diary entry
              </p>
              <Link href="/new">
                <Button size="lg" className="flex gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Entry
                </Button>
              </Link>
            </div>
          ) : (
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
                    <EntryCard entry={entry} />
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