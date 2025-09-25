import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error?: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState>{
  state: ErrorBoundaryState = { error: undefined };
  static getDerivedStateFromError(error:any){ return { error }; }
  componentDidCatch(error:any, info:any){ console.error('ErrorBoundary:', error, info); }
  render(){
    if(this.state.error){
      return this.props.fallback ?? (
        <div style={{padding:'24px'}}>
          <h1>Algo deu errado</h1>
          <p>Recarregue a página. Se persistir, verifique as variáveis de ambiente.</p>
          <details style={{marginTop:'16px'}}>
            <summary>Detalhes do erro</summary>
            <pre style={{background:'#f5f5f5', padding:'8px', borderRadius:'4px', marginTop:'8px', fontSize:'12px'}}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}