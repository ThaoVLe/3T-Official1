import { useNavigationControls } from "@/lib/navigation-context";
import { useLocation } from "wouter";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "./scroll-to-top";
import { BottomNav } from "./bottom-nav";
import { PageAnimation, PageTransition } from "./animations";
import { Spinner } from "./spinner";
import { useSettings } from "@/lib/settings-context";
import { useState, useEffect } from "react";
import { FacebookHeader } from "./facebook-header";

export function Layout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const nav = useNavigationControls();
  const settings = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PageAnimation>
      <div className="bg-background min-h-screen flex flex-col">
        <FacebookHeader />

        <div className="fixed bottom-20 right-5 z-20">
          <Button 
            size="lg" 
            className="rounded-full h-14 w-14 p-0 shadow-lg bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/new")} 
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>

        <main className="flex-1 pt-[56px] pb-16">
          {children}
        </main>

        <BottomNav />
        <ScrollToTop />
      </div>
    </PageAnimation>
  );
}