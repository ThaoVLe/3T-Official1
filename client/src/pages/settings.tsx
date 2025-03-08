import React from "react";
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
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const [, navigate] = useLocation();

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
                    <Switch />
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
                    <Switch />
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
                    <Switch />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Password Protection</Label>
                      <div className="text-sm text-muted-foreground">
                        Require password to open app
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Lock</Label>
                      <div className="text-sm text-muted-foreground">
                        Lock app after 5 minutes of inactivity
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Backup</h3>
                  <Button variant="outline" className="w-full justify-between">
                    Export All Data
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Reminders</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Reminder</Label>
                      <div className="text-sm text-muted-foreground">
                        Get reminded to write daily
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <Button variant="outline" className="w-full justify-between">
                    Set Reminder Time
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Other Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Summary</Label>
                      <div className="text-sm text-muted-foreground">
                        Receive weekly writing stats
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Data Management Settings */}
            <TabsContent value="data">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Storage</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Used Storage: 245 MB
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-1/4 bg-primary rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data Management</h3>
                  <Button variant="outline" className="w-full justify-between">
                    Manage Entries
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Import Data
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Clear All Data
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}
