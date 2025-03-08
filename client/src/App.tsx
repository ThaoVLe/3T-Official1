import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import EntryView from "@/pages/entry-view";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { ScrollToTop } from "./components/scroll-to-top";

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/new" component={Editor} />
        <Route path="/edit/:id" component={Editor} />
        <Route path="/entry/:id" component={EntryView} />
        <Route path="/settings" component={Settings} />
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
      <ScrollToTop />
      <AppRoutes />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;