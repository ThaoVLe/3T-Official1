import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import CurrentEntry from "@/pages/current-entry";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/new" component={Editor} />
        <Route path="/edit/:id" component={Editor} />
        <Route path="/entry/:id" component={CurrentEntry} />
        <Route path="/view/:id" component={CurrentEntry} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;