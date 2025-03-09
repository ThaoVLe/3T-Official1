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

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const settings = useSettings();

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
      <div className="min-h-screen bg-background">
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
                  <h3 className="text-lg font-semibold">Layout</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact View</Label>
                      <div className="text-sm text-muted-foreground">
                        Show more content in less space
                      </div>
                    </div>
                    <Switch 
                      checked={settings.isCompactMode}
                      onCheckedChange={settings.setCompactMode}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Font Size</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Large Text</Label>
                      <div className="text-sm text-muted-foreground">
                        Increase text size for better readability
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Password Protection</Label>
                      <div className="text-sm text-muted-foreground">
                        Require password for sensitive entries
                      </div>
                    </div>
                    <Switch
                      checked={settings.isPasswordProtectionEnabled}
                      onCheckedChange={settings.setPasswordProtection}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Lock</Label>
                      <div className="text-sm text-muted-foreground">
                        Lock app after period of inactivity
                      </div>
                    </div>
                    <Select
                      value={settings.autoLockTimeout.toString()}
                      onValueChange={(value) => settings.setAutoLockTimeout(parseInt(value))}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {autoLockOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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