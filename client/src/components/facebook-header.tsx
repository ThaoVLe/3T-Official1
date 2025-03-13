
import React from "react";
import { Search, Bell, MessageSquare, ChevronDown, Menu } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function FacebookHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border shadow-sm px-2">
      <div className="flex items-center justify-between h-full">
        {/* Left section - Logo and Search */}
        <div className="flex items-center">
          <Link href="/" className="text-primary font-bold text-2xl mr-2">
            f
          </Link>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search" 
              className="h-9 w-[240px] rounded-full bg-muted pl-9 pr-4 text-sm focus-visible:outline-none" 
            />
          </div>
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Middle section - Mobile Menu */}
        <div className="sm:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Right section - Icons and Profile */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <Link href="/settings">
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
