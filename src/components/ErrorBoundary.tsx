import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error?: any;
  errorInfo?: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState>{
  state: ErrorBoundaryState = { error: undefined };
  
  static getDerivedStateFromError(error: any) { 
    return { error }; 
  }
  
  componentDidCatch(error: any, errorInfo: any) { 
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    this.setState({ errorInfo });
  }
  
  handleReload = () => {
    window.location.reload();
  };
  
  handleDiagnostic = () => {
    window.location.href = '/__health';
  };
  
  render(){
    if(this.state.error){
      return this.props.fallback ?? (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Algo deu errado</h1>
              <p className="text-muted-foreground">
                O aplicativo encontrou um erro inesperado e precisa ser recarregado.
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-muted p-4 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-4 w-4 text-destructive" />
                <span className="font-medium text-sm">Detalhes do Erro</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {this.state.error?.message || this.state.error?.toString() || 'Erro desconhecido'}
              </div>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer hover:text-foreground">
                    Stack Trace
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-background rounded border overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button onClick={this.handleReload} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar Aplicativo
              </Button>
              
              <Button onClick={this.handleDiagnostic} variant="outline" className="w-full">
                <Bug className="mr-2 h-4 w-4" />
                Ir para Diagnóstico
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Se o problema persistir, verifique as configurações de ambiente
              ou entre em contato com o suporte.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}