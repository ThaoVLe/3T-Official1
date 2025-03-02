import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Home, List } from "lucide-react";
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
    icon: List,
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
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline"
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
