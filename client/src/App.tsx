import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import EntryView from "@/pages/entry-view";
import NotFound from "@/pages/not-found";
import { BrowserRouter as Router } from "react-router-dom";
import { ScrollToTop } from "./components/scroll-to-top"; // Import the ScrollToTop component

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/new" component={Editor} />
        <Route path="/edit/:id" component={Editor} />
        <Route path="/entry/:id" component={EntryView} />
        <Route path="/recent" component={Home} />
        <Route path="/calendar" component={Home} />
        <Route path="/entries" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop /> {/* Add ScrollToTop component here */}
        <Router />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;


// Added ScrollToTop component
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};