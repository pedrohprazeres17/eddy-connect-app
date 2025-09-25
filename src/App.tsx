import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import BootSequence from "@/components/BootSequence";
import DebugOverlay from "@/components/DebugOverlay";
import AppContent from "@/components/AppContent";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <BootSequence>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DebugOverlay />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </BootSequence>
  </BrowserRouter>
);

export default App;
