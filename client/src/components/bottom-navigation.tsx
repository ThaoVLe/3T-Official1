
import * as React from "react";
import { Link, useLocation } from "wouter";
import { Home, Plus, Settings } from "lucide-react";

export function BottomNavigation() {
  const [location] = useLocation();
  
  const scrollToTop = (e: React.MouseEvent) => {
    // Only perform scroll if we're already on the home page
    if (location === '/') {
      e.preventDefault();
      
      // Find the diary content container and scroll to top
      const diaryContent = document.querySelector('.diary-content');
      if (diaryContent) {
        diaryContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 pt-[5px]">
      <div className="grid h-full w-full grid-cols-3 mx-auto">
        <Link href="/">
          <button 
            type="button" 
            className="inline-flex flex-col items-center justify-center w-full hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={scrollToTop}
          >
            <Home className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Home</span>
          </button>
        </Link>
        
        <Link href="/new">
          <button type="button" className="inline-flex flex-col items-center justify-center w-full hover:bg-gray-50 dark:hover:bg-gray-800">
            <Plus className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">New</span>
          </button>
        </Link>
        
        <Link href="/settings">
          <button type="button" className="inline-flex flex-col items-center justify-center w-full hover:bg-gray-50 dark:hover:bg-gray-800">
            <Settings className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Settings</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
