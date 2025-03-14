import * as React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "./bottom-navigation";
import { useSettings } from "@/lib/settings";


interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [location] = useLocation();
  const settings = useSettings();

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showBottomNav = isMobile && location === '/';

  const rootClasses = React.useMemo(() => {
    const classes = ['min-h-screen bg-background'];
    if (settings.isLargeText) classes.push('large-text');
    return classes.join(' ');
  }, [settings.isLargeText]);

  return isMobile ? (
    <div className={rootClasses}>
      <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  ) : (
    <div className={rootClasses}>
      <div className="fixed left-0 top-0 bottom-0 w-[300px] border-r border-border">
        <div className="p-4">
          <h1 className="text-xl font-bold">Logo</h1>
        </div>
        <nav className="flex flex-col gap-2 p-2">
          <button className="flex items-center gap-2 p-3 hover:bg-accent rounded-md">
            <HomeIcon className="h-6 w-6" />
            <span>Home</span>
          </button>
          <button className="flex items-center gap-2 p-3 hover:bg-accent rounded-md">
            <SearchIcon className="h-6 w-6" />
            <span>Search</span>
          </button>
          <button className="flex items-center gap-2 p-3 hover:bg-accent rounded-md">
            <PlusIcon className="h-6 w-6" />
            <span>Create</span>
          </button>
        </nav>
      </div>
      <div className="ml-[300px] flex justify-center min-h-screen">
        <div className="w-[600px] max-w-[600px] border-x border-border">
          <div className="py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}