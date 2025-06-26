import { NavigationProvider } from "@/context/NavigationContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Suspense, lazy } from "react";
import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";

// Lazy-loaded pages
const ProjectListPage = lazy(() => import("./pages/ProjectListPage").then(m => ({ default: m.ProjectListPage })));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const PlannerPage = lazy(() => import("./pages/PlannerPage").then(m => ({ default: m.PlannerPage })));
const PlannerDetailPage = lazy(() => import("./pages/PlannerDetailPage"));
const StashPage = lazy(() => import("./pages/StashPage").then(m => ({ default: m.StashPage })));
const SwatchesPage = lazy(() => import("./pages/SwatchesPage").then(m => ({ default: m.SwatchesPage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ModalPlaygroundPage = lazy(() => import("./pages/ModalPlayground").then(m => ({ default: m.ModalPlayground })));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <NavigationProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<Navigate to="/planner" replace />} />

              {/* Protected routes */}
              <Route path="/planner" element={<RequireAuth component={PlannerPage} />} />
              <Route path="/planner/:plannerId" element={<RequireAuth component={PlannerDetailPage} />} />

              <Route path="/projects" element={<RequireAuth component={ProjectListPage} />} />
              <Route path="/projects/:projectId" element={<RequireAuth component={ProjectDetailPage} />} />

              <Route path="/stash" element={<RequireAuth component={StashPage} />} />
              <Route path="/swatches" element={<RequireAuth component={SwatchesPage} />} />

              {/* Playground route (development only) */}
              <Route path="/modal-playground" element={<RequireAuth component={ModalPlaygroundPage} />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </NavigationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
