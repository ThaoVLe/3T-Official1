import { SidebarNav } from "./sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-2 py-4">
            <Link href="/">
              <h1 className="font-semibold text-xl cursor-pointer">My Diary</h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <Link href="/new">
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                  </Button>
                </Link>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Navigation
                </h2>
                <SidebarNav />
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
