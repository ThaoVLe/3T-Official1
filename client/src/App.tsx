import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout";
import NewEntry from "@/pages/new-entry";
import Entries from "@/pages/entries";
import CurrentEntry from "@/pages/current-entry";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={Entries} />
          <Route path="/new" component={NewEntry} />
          <Route path="/entry/:id" component={CurrentEntry} />
        </Switch>
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}