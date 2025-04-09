
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotebookView from "./pages/NotebookView";
import SectionView from "./pages/SectionView";
import PageView from "./pages/PageView";
import NotFound from "./pages/NotFound";
import NewPage from "./pages/NewPage";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./context/AuthContext";

// Create a client with better caching for content stability across navigations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes to reduce refetching
      cacheTime: 15 * 60 * 1000, // 15 minutes to keep data in cache longer
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnReconnect: false, // Don't refetch on reconnect
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notebook/:notebookId" element={<NotebookView />} />
              <Route path="/notebook/:notebookId/section/:sectionId" element={<SectionView />} />
              <Route path="/page/:pageId" element={<PageView />} />
              <Route path="/new-page/:notebookId/:sectionId" element={<NewPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
