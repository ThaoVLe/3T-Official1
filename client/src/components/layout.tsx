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

  // Create class names based on settings
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
      <div className="desktop-layout w-full">
        <div className="desktop-content-wrapper">
          <div className="content-centered w-full">
            <div className="flex-1 overflow-auto pb-8 pt-4 relative">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}