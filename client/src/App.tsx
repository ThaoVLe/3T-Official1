import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout"; // Assuming this component is now created
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import NotFound from "@/pages/not-found";

// Bottom Navigation Component (New Component)
const BottomNavigation = () => {
  return (
    <nav className="bottom-nav">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/new">New Entry</a></li>
        <li><a href="/calendar">Calendar</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  );
};


function Router() {
  return (
    <Layout bottomNavigation={<BottomNavigation />}> {/* Added bottomNavigation prop */}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/new" component={Editor} />
        <Route path="/edit/:id" component={Editor} />
        <Route path="/calendar" component={()=> <div>Calendar View</div>} /> {/* Placeholder */}
        <Route path="/settings" component={()=> <div>Settings View</div>} /> {/* Placeholder */}
        <Route path="/recent" component={Home} />
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