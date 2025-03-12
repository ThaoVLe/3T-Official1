
import React from 'react';
import { Search, Home, Bell, MessageSquare, Menu, User } from 'lucide-react';
import { Link } from 'wouter';

export function FacebookHeader() {
  return (
    <header className="sticky top-0 bg-white shadow-sm border-b z-30">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section - Logo and search */}
        <div className="flex items-center gap-2 flex-1">
          <Link href="/">
            <h1 className="text-blue-600 font-bold text-2xl cursor-pointer">JournalApp</h1>
          </Link>
          <div className="relative hidden md:flex items-center ml-2">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search entries..." 
              className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm w-full max-w-[240px] focus:outline-none"
            />
          </div>
        </div>
        
        {/* Middle section - Navigation icons */}
        <div className="flex items-center justify-center flex-1">
          <div className="flex items-center">
            <Link href="/">
              <div className="px-8 py-1 border-b-2 border-blue-500 text-blue-500">
                <Home className="h-6 w-6" />
              </div>
            </Link>
            <Link href="/notifications">
              <div className="px-8 py-1 text-gray-500 hover:bg-gray-100 rounded-md mx-1">
                <Bell className="h-6 w-6" />
              </div>
            </Link>
            <Link href="/messages">
              <div className="px-8 py-1 text-gray-500 hover:bg-gray-100 rounded-md mx-1">
                <MessageSquare className="h-6 w-6" />
              </div>
            </Link>
          </div>
        </div>
        
        {/* Right section - Profile and menu */}
        <div className="flex items-center justify-end gap-2 flex-1">
          <button className="bg-gray-200 p-2 rounded-full">
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <Link href="/settings">
            <div className="bg-gray-200 p-2 rounded-full">
              <User className="h-5 w-5 text-gray-700" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
