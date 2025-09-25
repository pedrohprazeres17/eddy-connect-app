import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';

interface NavigationContextType {
  navigate: NavigateFunction;
  isReady: boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  
  const value: NavigationContextType = {
    navigate,
    isReady: true,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useAppNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    // Retorna um mock seguro se não estiver no contexto do Router
    return {
      navigate: () => {
        console.warn('Navigation called outside Router context');
      },
      isReady: false,
    };
  }
  return context;
}