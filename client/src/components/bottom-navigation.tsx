import * as React from "react";
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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border pt-[5px]">
      <div className="grid h-full w-full grid-cols-3 mx-auto">
        <button 
          type="button" 
          className="inline-flex flex-col items-center justify-center w-full hover:bg-accent"
          onClick={(e) => {
            if (location === '/') {
              scrollToTop(e);
            } else {
              window.location.href = '/';
            }
          }}
        >
          <Home className="w-6 h-6 mb-1 text-foreground" />
          <span className="text-xs text-foreground">Home</span>
        </button>

        <button 
          type="button" 
          className="inline-flex flex-col items-center justify-center w-full hover:bg-accent"
          onClick={() => window.location.href = '/new'}
        >
          <Plus className="w-6 h-6 mb-1 text-foreground" />
          <span className="text-xs text-foreground">New</span>
        </button>

        <Link href="/settings">
          <button type="button" className="inline-flex flex-col items-center justify-center w-full hover:bg-accent">
            <Settings className="w-6 h-6 mb-1 text-foreground" />
            <span className="text-xs text-foreground">Settings</span>
          </button>
        </Link>
      </div>
    </div>
  );
}