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
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);
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
    <div className={`${rootClasses} flex justify-center`}>
      {/* Left sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-[244px] border-r border-border bg-background">
        <div className="flex flex-col h-full p-4">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                <img src="/logo.png" alt="Logo" className="w-8 h-8" />
              </Button>
            </Link>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start gap-4 p-4 h-auto">
                <Home className="w-6 h-6" />
                <span className="text-lg">Home</span>
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-4 p-4 h-auto">
              <Search className="w-6 h-6" />
              <span className="text-lg">Search</span>
            </Button>
            <Link href="/new">
              <Button variant="ghost" className="w-full justify-start gap-4 p-4 h-auto">
                <Plus className="w-6 h-6" />
                <span className="text-lg">Create</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start gap-4 p-4 h-auto mt-auto">
                <Settings className="w-6 h-6" />
                <span className="text-lg">Settings</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="w-[600px] min-h-screen border-x border-border">
        {children}
      </main>

      {/* Right sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-[320px] p-6 border-l border-border">
        <div className="rounded-xl bg-card p-6 border border-border">
          <h2 className="text-xl font-semibold mb-2">Log in or sign up</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Sign in to see and manage your diary entries.
          </p>
          <div className="space-y-2">
            <Button className="w-full" variant="default">
              Log in
            </Button>
            <Button className="w-full" variant="outline">
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}