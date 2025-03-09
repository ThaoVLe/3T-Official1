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
  CloudOff,
  RefreshCw
} from "lucide-react";
import { useSettings } from "@/lib/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSyncStore } from "@/lib/store";
import { getAllEntries, getDatabaseStats } from "@/lib/indexedDB";
import { auth, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { googleDriveService } from "@/lib/googleDrive";

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const settings = useSettings();
  const syncStore = useSyncStore();
  const [localEntries, setLocalEntries] = React.useState<any[]>([]);
  const [showDebug, setShowDebug] = React.useState(false);
  const { toast } = useToast();
  const [user, setUser] = React.useState(auth?.currentUser || null);
  const [dbStats, setDbStats] = React.useState<{
    entriesCount: number;
    pendingSyncCount: number;
    lastModifiedEntry: Date | null;
  }>({
    entriesCount: 0,
    pendingSyncCount: 0,
    lastModifiedEntry: null
  });
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [backupInProgress, setBackupInProgress] = React.useState(false);
  const [backupError, setBackupError] = React.useState<string | null>(null);

  // Listen for auth state changes
  React.useEffect(() => {
    if (!auth) {
      console.error('Firebase auth not initialized');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    }, (error) => {
      console.error('Auth state change error:', error);
      toast({
        title: "Error",
        description: "Failed to monitor authentication state",
        variant: "destructive"
      });
    });

    return () => unsubscribe();
  }, [toast]);

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

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      setAuthError(null);
      const result = await signInWithGoogle();
      if (result?.user) {
        toast({
          title: "Success",
          description: "Successfully signed in with Google",
        });
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      let errorMessage = "Failed to sign in with Google";

      // Check for specific error types
      if ((error as any).code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by your browser. Please allow pop-ups for this site.";
      } else if ((error as any).code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        errorMessage = `This domain (${currentDomain}) is not authorized`;
        setAuthError(`Please add this domain to Firebase Console:\n${currentDomain}`);
      } else if ((error as any).code === 'auth/invalid-oauth-provider') {
        errorMessage = "Google Sign-in is not enabled in Firebase Console.";
        setAuthError("Please enable Google Sign-in in Firebase Console under Authentication > Sign-in methods");
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      await signOutUser();
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
    } catch (error) {
      console.error('Sign-out Error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  // Early return if Firebase is not initialized
  if (!auth) {
    return (
      <PageTransition direction={1}>
        <div className="min-h-screen bg-background p-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Firebase Not Initialized</h2>
            <p className="text-muted-foreground">
              Firebase authentication is not available. Please check your configuration.
            </p>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const handleCreateBackup = async () => {
    try {
      setBackupInProgress(true);
      setBackupError(null);

      // Get all entries from IndexedDB
      const entries = await getAllEntries();

      // Create backup using Google Drive service
      await googleDriveService.createBackup(entries);

      toast({
        title: "Success",
        description: "Backup created successfully",
      });

      // Update backup settings with latest backup time
      syncStore.updateBackupSettings({
        lastBackup: new Date().toISOString()
      });
    } catch (error) {
      console.error('Backup creation error:', error);
      setBackupError('Failed to create backup. Please try again.');
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive"
      });
    } finally {
      setBackupInProgress(false);
    }
  };


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
              <TabsTrigger value="backup" className="flex flex-col items-center gap-1 py-2">
                <CloudOff className="h-4 w-4" />
                <span className="text-xs">Backup</span>
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

            {/* Backup Settings */}
            <TabsContent value="backup">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Google Account</h3>
                  {!user ? (
                    <>
                      <Button
                        className="w-full"
                        onClick={handleGoogleSignIn}
                      >
                        Sign in with Google
                      </Button>
                      {authError && (
                        <div className="mt-4 p-4 border rounded bg-destructive/10 text-destructive">
                          <p className="font-medium">Configuration Required</p>
                          <p className="text-sm mt-1">{authError}</p>
                          <p className="text-sm mt-2">
                            To fix this:
                          </p>
                          <ol className="text-sm list-decimal list-inside mt-1">
                            <li>Go to Firebase Console</li>
                            <li>Navigate to Authentication</li>
                            <li>Click on &quot;Sign-in method&quot; tab</li>
                            <li>Enable &quot;Google&quot; as a sign-in provider</li>
                            <li>Save the changes</li>
                          </ol>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Signed in as</Label>
                          <div className="text-sm text-muted-foreground">
                            {user?.email}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Button>
                      </div>

                      <div className="pt-4">
                        <h3 className="text-lg font-semibold">Backup Settings</h3>
                        {/* Enable Backups */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="space-y-0.5">
                            <Label>Enable Automatic Backups</Label>
                            <div className="text-sm text-muted-foreground">
                              Automatically backup your entries to Google Drive
                            </div>
                          </div>
                          <Switch
                            checked={syncStore.backupSettings.enabled}
                            onCheckedChange={(checked) =>
                              syncStore.updateBackupSettings({ enabled: checked })}
                          />
                        </div>

                        {/* Backup Frequency */}
                        <div className="space-y-2 mt-4">
                          <Label>Backup Frequency</Label>
                          <Select
                            value={syncStore.backupSettings.frequency}
                            onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                              syncStore.updateBackupSettings({ frequency: value })}
                            disabled={!syncStore.backupSettings.enabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Last Backup Info */}
                        {syncStore.backupSettings.lastBackup && (
                          <div className="text-sm text-muted-foreground mt-4">
                            Last backup: {new Date(syncStore.backupSettings.lastBackup).toLocaleString()}
                          </div>
                        )}

                        {/* Manual Sync Button */}
                        <Button
                          className="w-full mt-4"
                          onClick={() => syncStore.syncEntries()}
                          disabled={!syncStore.isOnline || syncStore.isSyncing}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {syncStore.isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                        {user && (
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label>Google Drive Backup</Label>
                                <div className="text-sm text-muted-foreground">
                                  Create a backup of your entries on Google Drive
                                </div>
                              </div>
                              <Button
                                onClick={handleCreateBackup}
                                disabled={backupInProgress || !user}
                              >
                                {backupInProgress ? 'Creating Backup...' : 'Create Backup'}
                              </Button>
                            </div>

                            {backupError && (
                              <div className="text-sm text-destructive mt-2">
                                {backupError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
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

                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Firebase Authentication Status</h4>
                    <div className="text-sm">
                      {auth ? 'Initialized' : 'Not Initialized'}
                    </div>
                  </div>

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