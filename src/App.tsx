
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { PatternListPage } from "./pages/PatternListPage";
import { PatternDetailPage } from "./pages/PatternDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/patterns" element={<Index />} />
          <Route path="/patterns/:patternId" element={<Index />} />
          <Route path="/planner" element={<Index />} />
          <Route path="/planner/:plannerId" element={<Index />} />
          {/* Redirect old project URLs to patterns for backward compatibility */}
          <Route path="/projects" element={<Navigate to="/patterns" replace />} />
          <Route path="/projects/:projectId" element={<Navigate to="/patterns/:projectId" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
