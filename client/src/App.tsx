import React from 'react';
import { Route, Switch, useLocation } from "wouter";
import AuthPage from "./pages/auth";
import Home from './pages/home';
import NewEntry from './pages/new-entry';
import ViewEntry from './pages/view-entry';
import EditEntry from './pages/edit-entry';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/lib/theme-provider";
import { ScrollToTop } from "./components/scroll-to-top";

function App() {
  const [location] = useLocation();
  console.log("Current location:", location); // Debug current route

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={Home} />
            <Route path="/new" component={NewEntry} />
            <Route path="/entries/:id" component={ViewEntry} />
            <Route path="/entries/:id/edit" component={EditEntry} />
          </Switch>
          <Toaster />
          <ScrollToTop />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;