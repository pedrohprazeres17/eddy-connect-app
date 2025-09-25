import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import BootGuard from "@/components/BootGuard";
import DebugOverlay from "@/components/DebugOverlay";

// Pages
import Login from "./pages/Login";
import HomeAluno from "./pages/HomeAluno";
import HomeMentor from "./pages/HomeMentor";
import Mentores from "./pages/Mentores";
import MentorPerfil from "./pages/MentorPerfil";
import Grupos from "./pages/Grupos";
import GrupoDetalhe from "./pages/GrupoDetalhe";
import Sessoes from "./pages/Sessoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <BootGuard>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <DebugOverlay />
          <BrowserRouter>
          <Routes>
            {/* Rota raiz redireciona baseado na autenticação */}
            <Route 
              path="/" 
              element={<RoleBasedRedirect />} 
            />

            {/* Página de login */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas para alunos */}
            <Route 
              path="/home-aluno" 
              element={
                <ProtectedRoute requiredRole="aluno">
                  <HomeAluno />
                </ProtectedRoute>
              } 
            />

            {/* Rotas protegidas para mentores */}
            <Route 
              path="/home-mentor" 
              element={
                <ProtectedRoute requiredRole="mentor">
                  <HomeMentor />
                </ProtectedRoute>
              } 
            />

            {/* Rotas compartilhadas (alunos e mentores) */}
            <Route 
              path="/mentores" 
              element={
                <ProtectedRoute>
                  <Mentores />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/mentor/:id" 
              element={
                <ProtectedRoute>
                  <MentorPerfil />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/grupos" 
              element={
                <ProtectedRoute>
                  <Grupos />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/grupo/:id" 
              element={
                <ProtectedRoute>
                  <GrupoDetalhe />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/sessoes" 
              element={
                <ProtectedRoute>
                  <Sessoes />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </BootGuard>
);

// Componente helper para redirecionar baseado no role
function RoleBasedRedirect() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const redirectPath = user.role === 'aluno' ? '/home-aluno' : '/home-mentor';
  return <Navigate to={redirectPath} replace />;
}

export default App;
