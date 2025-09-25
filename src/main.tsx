import { createRoot } from "react-dom/client";
import { StrictMode, Suspense } from 'react';
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{padding:24, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh'}}>Carregando…</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
