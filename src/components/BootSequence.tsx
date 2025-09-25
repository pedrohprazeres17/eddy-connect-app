import { useState, useEffect } from 'react';
import { getEnv } from '@/utils/safeEnv';
import { airtable } from '@/services/airtableClient';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface BootSequenceProps {
  children: React.ReactNode;
}

interface HealthCheck {
  table: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function BootSequence({ children }: BootSequenceProps) {
  const [stage, setStage] = useState<'env' | 'health' | 'ready' | 'error'>('env');
  const [envMissing, setEnvMissing] = useState<string[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  const validateEnv = () => {
    const { missing } = getEnv();
    setEnvMissing(missing);
    return missing.length === 0;
  };

  const performHealthCheck = async () => {
    const tables = ['Users', 'Grupos', 'Sessoes'];
    const checks: HealthCheck[] = tables.map(table => ({
      table,
      status: 'pending'
    }));
    
    setHealthChecks(checks);
    setStage('health');

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      try {
        await airtable.list(table, { pageSize: 1 });
        checks[i] = { table, status: 'success' };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        checks[i] = { table, status: 'error', error: errorMessage };
        console.error(`Health check failed for ${table}:`, error);
      }
      setHealthChecks([...checks]);
    }

    const hasErrors = checks.some(check => check.status === 'error');
    if (hasErrors) {
      setStage('error');
    } else {
      setStage('ready');
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    
    if (!validateEnv()) {
      setStage('env');
    } else {
      await performHealthCheck();
    }
    
    setIsRetrying(false);
  };

  useEffect(() => {
    if (validateEnv()) {
      performHealthCheck();
    } else {
      setStage('env');
    }
  }, []);

  if (stage === 'ready') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* ENV Validation Error */}
        {stage === 'env' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configuração Incompleta</h1>
              <p className="text-muted-foreground mt-2">
                Faltam as seguintes variáveis de ambiente:
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-left">
              <ul className="space-y-1">
                {envMissing.map(key => (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <code className="bg-background px-2 py-1 rounded text-xs">{key}</code>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Adicione essas variáveis em:</p>
              <p className="font-mono text-xs mt-1">Settings → Environment Variables</p>
            </div>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Tentar Novamente'
              )}
            </Button>
          </div>
        )}

        {/* Health Check in Progress */}
        {stage === 'health' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <RefreshCw className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Verificando Conexão</h1>
              <p className="text-muted-foreground mt-2">
                Testando acesso às tabelas do Airtable...
              </p>
            </div>
            <div className="space-y-2">
              {healthChecks.map(check => (
                <div key={check.table} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{check.table}</span>
                  {check.status === 'pending' && (
                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {check.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {check.status === 'error' && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Check Errors */}
        {stage === 'error' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Erro de Conexão</h1>
              <p className="text-muted-foreground mt-2">
                Falha ao conectar com algumas tabelas do Airtable:
              </p>
            </div>
            <div className="space-y-2 text-left">
              {healthChecks
                .filter(check => check.status === 'error')
                .map(check => (
                  <div key={check.table} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-sm">Tabela: {check.table}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {check.error}
                    </p>
                  </div>
                ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Verifique:</p>
              <ul className="text-xs mt-1 space-y-1">
                <li>• API Key está correto e tem permissões</li>
                <li>• Base ID está correto</li>
                <li>• Nomes das tabelas existem na base</li>
              </ul>
            </div>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Tentando Novamente...
                </>
              ) : (
                'Tentar Novamente'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}