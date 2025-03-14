import * as React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "./bottom-navigation";
import { useSettings } from "@/lib/settings";
import { SidebarNav } from "./sidebar-nav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [location] = useLocation();
  const settings = useSettings();

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1000);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showBottomNav = isMobile && location === '/';

  const rootClasses = React.useMemo(() => {
    const classes = ['min-h-screen bg-background'];
    if (settings.isLargeText) classes.push('large-text');
    return classes.join(' ');
  }, [settings.isLargeText]);


  // Mobile layout
  if (isMobile) {
    return (
      <div className={rootClasses}>
        <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>
          {children}
        </main>
        {showBottomNav && <BottomNavigation />}
      </div>
    );
  }

  // Desktop layout (Threads-style)
  return (
    <div className="threads-layout">
      {/* Left sidebar */}
      <div className="threads-sidebar touch-scroll">
        <div className="flex flex-col h-full p-4">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start p-4 h-auto text-lg font-medium">
                <img src="/logo.png" alt="Logo" className="w-8 h-8" />
              </Button>
            </Link>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/">
              <Button variant="ghost" className="nav-button">
                <Home className="h-6 w-6" />
                <span>Home</span>
              </Button>
            </Link>
            <Button variant="ghost" className="nav-button">
              <Search className="h-6 w-6" />
              <span>Search</span>
            </Button>
            <Link href="/new">
              <Button variant="ghost" className="nav-button">
                <Plus className="h-6 w-6" />
                <span>Create</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="nav-button mt-auto">
                <Settings className="h-6 w-6" />
                <span>Settings</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="threads-main touch-scroll">
        <div className="threads-content">
          {children}
        </div>
      </main>

      {/* Right sidebar */}
      <div className="threads-sidebar-right touch-scroll">
        <div className="p-6">
          <div className="rounded-xl bg-card p-6 border border-border">
            <h2 className="text-xl font-semibold mb-2">Log in or sign up</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Sign in to see and manage your diary entries.
            </p>
            <div className="space-y-2">
              <Button className="button-threads w-full" variant="default">
                Log in
              </Button>
              <Button className="button-threads w-full" variant="outline">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}