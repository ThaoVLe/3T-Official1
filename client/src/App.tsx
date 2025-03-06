import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import EntryView from "@/pages/entry-view";
import NotFound from "@/pages/not-found";
import { AnimatePresence } from "framer-motion";


function Router() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Switch location={location} key={location.pathname}>
          <Route path="/" component={Home} />
          <Route path="/new" component={Editor} />
          <Route path="/edit/:id" component={Editor} />
          <Route path="/entry/:id" component={EntryView} />
          <Route path="/recent" component={Home} />
          <Route path="/calendar" component={Home} />
          <Route path="/entries" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
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