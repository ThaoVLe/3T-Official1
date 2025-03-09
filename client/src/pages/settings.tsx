import * as React from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/animations";
import {
  Moon,
  Sun,
  Lock,
  Bell,
  Database,
  ArrowLeft,
} from "lucide-react";
import { useSettings } from "@/lib/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Placeholder for toast function - replace with your actual implementation
const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
  console.log(`Toast: ${title} - ${description} (${variant || 'info'})`);
};

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const settings = useSettings();

  // Touch swipe handling
  const [touchStartX, setTouchStartX] = React.useState(0);
  const [touchStartY, setTouchStartY] = React.useState(0);
  const [touchStartTime, setTouchStartTime] = React.useState(0);
  const pageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
      setTouchStartTime(Date.now());
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid scrolling conflicts
      if (Math.abs(e.touches[0].clientX - touchStartX) > Math.abs(e.touches[0].clientY - touchStartY)) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      console.log("Swipe detected:", {
        swipeDistance,
        verticalDistance,
        swipeTime,
        condition: ((swipeDistance > 80 || (swipeDistance > 50 && swipeTime < 300)) && verticalDistance < 30)
      });

      // If swiped right far enough and fast enough (not too much vertical movement)
      if ((swipeDistance > 80 || (swipeDistance > 50 && swipeTime < 300)) && verticalDistance < 30) {
        // Get the last scroll position from session storage
        const lastScrollPosition = sessionStorage.getItem('homeScrollPosition');

        // Navigate back to home
        navigate('/');

        // After navigation, restore scroll position (needs to be handled in the main page)
        if (lastScrollPosition) {
          sessionStorage.setItem('shouldRestoreScroll', 'true');
        }
      }
    };

    // Get current ref element
    const element = pageRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, touchStartX, touchStartY]);

  // Save scroll position when leaving settings page
  React.useEffect(() => {
    return () => {
      const homeScrollPosition = sessionStorage.getItem('homeScrollPosition');
      if (homeScrollPosition) {
        sessionStorage.setItem('shouldRestoreScroll', 'true');
      }
    };
  }, []);

  const autoLockOptions = [
    { value: "0", label: "Disabled" },
    { value: "1", label: "1 minute" },
    { value: "5", label: "5 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
  ];


  return (
    <PageTransition direction={1}>
      <div ref={pageRef} className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-between flex-1">
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-6 max-w-2xl">
          <Tabs defaultValue="appearance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance" className="flex flex-col items-center gap-1 py-2">
                <Sun className="h-4 w-4" />
                <span className="text-xs">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex flex-col items-center gap-1 py-2">
                <Lock className="h-4 w-4" />
                <span className="text-xs">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col items-center gap-1 py-2">
                <Bell className="h-4 w-4" />
                <span className="text-xs">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex flex-col items-center gap-1 py-2">
                <Database className="h-4 w-4" />
                <span className="text-xs">Data</span>
              </TabsTrigger>
            </TabsList>

            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Theme</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <div className="text-sm text-muted-foreground">
                        Switch between light and dark theme
                      </div>
                    </div>
                    <Switch
                      checked={settings.theme === 'dark'}
                      onCheckedChange={(checked) => settings.setTheme(checked ? 'dark' : 'light')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Text Size</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Larger Text</Label>
                      <div className="text-sm text-muted-foreground">
                        Make text larger and easier to read throughout the app
                      </div>
                    </div>
                    <Switch
                      checked={settings.isLargeText}
                      onCheckedChange={settings.setLargeText}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sharing</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Sharing</Label>
                      <div className="text-sm text-muted-foreground">
                        Allow entries to be shared publicly
                      </div>
                    </div>
                    <Switch
                      checked={settings.isPublicSharingEnabled}
                      onCheckedChange={settings.setPublicSharing}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card className="p-6">Notification settings coming soon...</Card>
            </TabsContent>

            {/* Data Management Settings */}
            <TabsContent value="data">
              <Card className="p-6">Data management settings coming soon...</Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}