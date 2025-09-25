import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEnv } from '@/utils/safeEnv';
import { airtable } from '@/services/airtableClient';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TableHealth {
  table: string;
  status: 'checking' | 'success' | 'error';
  error?: string;
  responseTime?: number;
}

export default function HealthDiagnostic() {
  const navigate = useNavigate();
  const [envStatus, setEnvStatus] = useState<{ valid: boolean; missing: string[] } | null>(null);
  const [tableHealth, setTableHealth] = useState<TableHealth[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const checkEnvironment = () => {
    const { env, missing } = getEnv();
    setEnvStatus({ valid: missing.length === 0, missing });
    return env;
  };

  const checkTableHealth = async () => {
    const tables = ['Users', 'Grupos', 'Sessoes'];
    const health: TableHealth[] = tables.map(table => ({
      table,
      status: 'checking'
    }));
    
    setTableHealth(health);

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const startTime = Date.now();
      
      try {
        await airtable.list(table, { pageSize: 1 });
        const responseTime = Date.now() - startTime;
        health[i] = { table, status: 'success', responseTime };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        health[i] = { table, status: 'error', error: errorMessage, responseTime };
      }
      
      setTableHealth([...health]);
    }
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    checkEnvironment();
    await checkTableHealth();
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diagnóstico do Sistema</h1>
            <p className="text-muted-foreground">
              Verificação completa da configuração e conectividade
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao App
            </Button>
            <Button onClick={runDiagnostic} disabled={isRunning}>
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Executar Novamente
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {envStatus?.valid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Variáveis de Ambiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {envStatus ? (
              <div className="space-y-3">
                {envStatus.valid ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">
                      Todas Configuradas
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Todas as variáveis necessárias estão presentes
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {envStatus.missing.length} Faltando
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {envStatus.missing.map(key => (
                        <div key={key} className="flex items-center gap-2 p-2 bg-destructive/10 rounded">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <code className="text-sm">{key}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Carregando...</div>
            )}
          </CardContent>
        </Card>

        {/* Table Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {tableHealth.length > 0 && tableHealth.every(t => t.status === 'success') ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : tableHealth.some(t => t.status === 'error') ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              Conectividade Airtable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tableHealth.length === 0 ? (
                <div className="text-muted-foreground">Iniciando verificação...</div>
              ) : (
                tableHealth.map(health => (
                  <div key={health.table} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {health.status === 'checking' && (
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {health.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {health.status === 'error' && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <div className="font-medium">Tabela: {health.table}</div>
                        {health.error && (
                          <div className="text-sm text-destructive">{health.error}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {health.responseTime && (
                        <div className="text-sm text-muted-foreground">
                          {health.responseTime}ms
                        </div>
                      )}
                      <Badge 
                        variant={
                          health.status === 'success' ? 'default' : 
                          health.status === 'error' ? 'destructive' : 
                          'secondary'
                        }
                        className={health.status === 'success' ? 'bg-green-500' : undefined}
                      >
                        {health.status === 'checking' ? 'Verificando' : 
                         health.status === 'success' ? 'OK' : 'Erro'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">URL Atual</div>
                <div className="text-muted-foreground">{window.location.href}</div>
              </div>
              <div>
                <div className="font-medium">User Agent</div>
                <div className="text-muted-foreground truncate">{navigator.userAgent}</div>
              </div>
              <div>
                <div className="font-medium">LocalStorage</div>
                <div className="text-muted-foreground">
                  {localStorage.getItem('educonnect_auth') ? 'Dados de auth presentes' : 'Nenhum dado de auth'}
                </div>
              </div>
              <div>
                <div className="font-medium">Timestamp</div>
                <div className="text-muted-foreground">{new Date().toISOString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}