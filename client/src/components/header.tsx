
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Your App</span>
          </a>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
