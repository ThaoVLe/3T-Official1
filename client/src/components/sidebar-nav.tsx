import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Home, Hash } from "lucide-react";
import { Link, useLocation } from "wouter";

const routes = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    title: "Recent",
    icon: Clock,
    href: "/recent",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
  },
  {
    title: "All Entries",
    icon: FileText,
    href: "/entries",
  },
];

export function SidebarNav() {
  const [location] = useLocation();

  return (
    <nav className="space-y-1">
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant={location === route.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              location === route.href
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "hover:bg-primary/5"
            )}
          >
            <route.icon className="mr-2 h-4 w-4" />
            {route.title}
          </Button>
        </Link>
      ))}
    </nav>
  );
}