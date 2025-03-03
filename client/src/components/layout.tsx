import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom"; // Corrected import for Link
import { SidebarNav } from "./sidebar-nav";
import { Input } from "@/components/ui/input";
import * as React from "react";


interface LayoutProps {
  children: React.ReactNode;
}

const layoutStyle = {
  width: '100vw',
  height: '100vh',
  overflowX: 'hidden'
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background" style={layoutStyle}>
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-2 py-4">
            <Link to="/">
              <h1 className="font-semibold text-xl cursor-pointer bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                My Diary
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <Link to="/new">
                  <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                  </Button>
                </Link>
              </div>
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search entries..." className="pl-8" />
                </div>
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

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="pb-safe">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}