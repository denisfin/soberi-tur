import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TourPage from "@/pages/tour";
import TourPreviewPage from "@/pages/tour-preview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tour/:id" component={TourPreviewPage} />
      <Route path="/tour" component={TourPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
