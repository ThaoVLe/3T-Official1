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
  Database,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useSettings } from "@/lib/settings";
import { useSyncStore } from "@/lib/store";
import { getAllEntries, getDatabaseStats } from "@/lib/indexedDB";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const settings = useSettings();
  const syncStore = useSyncStore();
  const [localEntries, setLocalEntries] = React.useState<any[]>([]);
  const [showDebug, setShowDebug] = React.useState(false);
  const { toast } = useToast();
  const [dbStats, setDbStats] = React.useState<{
    entriesCount: number;
    pendingSyncCount: number;
    lastModifiedEntry: Date | null;
  }>({
    entriesCount: 0,
    pendingSyncCount: 0,
    lastModifiedEntry: null
  });

  // Load local entries and database stats for debug view
  const loadDatabaseInfo = async () => {
    try {
      const [entries, stats] = await Promise.all([
        getAllEntries(),
        getDatabaseStats()
      ]);
      setLocalEntries(entries);
      setDbStats(stats);
    } catch (error) {
      console.error('Error loading database info:', error);
      toast({
        title: "Error",
        description: "Failed to load local storage information",
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    if (showDebug) {
      loadDatabaseInfo();
    }
  }, [showDebug]);

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance" className="flex flex-col items-center gap-1 py-2">
                <Sun className="h-4 w-4" />
                <span className="text-xs">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex flex-col items-center gap-1 py-2">
                <Lock className="h-4 w-4" />
                <span className="text-xs">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex flex-col items-center gap-1 py-2">
                <Database className="h-4 w-4" />
                <span className="text-xs">Debug</span>
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

            {/* Debug View */}
            <TabsContent value="debug">
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Local Storage Debug</h3>

                  {/* Database Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded">
                      <div className="text-sm text-muted-foreground">Total Entries</div>
                      <div className="text-2xl font-semibold">{dbStats.entriesCount}</div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-sm text-muted-foreground">Pending Sync</div>
                      <div className="text-2xl font-semibold">{dbStats.pendingSyncCount}</div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-sm text-muted-foreground">Last Modified</div>
                      <div className="text-sm">
                        {dbStats.lastModifiedEntry
                          ? new Date(dbStats.lastModifiedEntry).toLocaleString()
                          : 'Never'}
                      </div>
                    </div>
                  </div>

                  {/* Manual Sync Button */}
                  <Button
                    className="w-full mt-4"
                    onClick={() => syncStore.syncEntries()}
                    disabled={!syncStore.isOnline || syncStore.isSyncing}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {syncStore.isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>

                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Entries List</h4>
                    <Button
                      onClick={() => {
                        setShowDebug(!showDebug);
                        if (!showDebug) loadDatabaseInfo();
                      }}
                      size="sm"
                    >
                      {showDebug ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>

                  {showDebug && (
                    <div className="mt-4 space-y-2">
                      <div className="max-h-96 overflow-auto space-y-2">
                        {localEntries.map((entry: any) => (
                          <div key={entry.id} className="p-4 border rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{entry.title || 'Untitled'}</p>
                                <p className="text-sm text-muted-foreground">ID: {entry.id}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                entry.syncStatus === 'synced'
                                  ? 'bg-green-100 text-green-800'
                                  : entry.syncStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {entry.syncStatus}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              Last Modified: {new Date(entry.lastModified).toLocaleString()}
                            </div>
                            {entry.content && (
                              <div className="mt-2 text-sm text-muted-foreground truncate">
                                {entry.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}