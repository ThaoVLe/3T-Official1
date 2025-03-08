import * as React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "./bottom-navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [location] = useLocation();

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showBottomNav = isMobile && location === '/';

  return isMobile ? (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  ) : (
    <SidebarProvider defaultOpen={true}>
      <div className="grid lg:grid-cols-[280px_1fr] min-h-screen">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-2 py-4">
            <Link href="/">
              <h1 className="font-semibold text-xl cursor-pointer bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                My Diary
              </h1>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <Link href="/new">
                  <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                  </Button>
                </Link>
              </div>
              <div className="px-3 py-2">
                <form className="w-full">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      className="pl-8"
                    />
                  </div>
                </form>
              </div>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="p-4 pt-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}