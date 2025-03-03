
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, PlusCircle, Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/" 
    },
    { 
      icon: Calendar, 
      label: "Calendar", 
      path: "/calendar" 
    },
    { 
      icon: PlusCircle, 
      label: "New Entry", 
      path: "/new",
      highlight: true
    },
    { 
      icon: BookOpen, 
      label: "Journal", 
      path: "/journal" 
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/settings" 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2 z-50">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={index}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              isActive ? "text-primary" : "text-gray-500"
            )}
            onClick={() => navigate(item.path)}
          >
            {item.highlight ? (
              <div className="bg-primary rounded-full p-3 -mt-8 shadow-md">
                <item.icon className="h-6 w-6 text-white" />
              </div>
            ) : (
              <>
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-500")} />
                <span className="text-xs mt-1">{item.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
