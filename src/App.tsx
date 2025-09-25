import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import BootSequence from "@/components/BootSequence";
import DebugOverlay from "@/components/DebugOverlay";
import AppContent from "@/components/AppContent";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <BootSequence>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NavigationProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <DebugOverlay />
              <AppContent />
            </AuthProvider>
          </NavigationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BootSequence>
  </BrowserRouter>
);

export default App;
