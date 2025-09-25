import { getEnv } from '../utils/safeEnv';

export default function BootGuard({ children }: { children: React.ReactNode }) {
  const { env, missing } = getEnv();
  if (missing.length) {
    console.error('ENV faltando:', missing);
    return (
      <div style={{padding:24, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', minHeight: '100vh'}}>
        <h2>Configuração incompleta</h2>
        <p>Faltam variáveis: {missing.join(', ')}.</p>
        <p>Adicione-as no arquivo .env na raiz do projeto.</p>
        <details style={{marginTop: '16px'}}>
          <summary>Variáveis encontradas</summary>
          <pre style={{background: 'hsl(var(--muted))', padding: '8px', borderRadius: '4px', marginTop: '8px'}}>
            {JSON.stringify(env, null, 2)}
          </pre>
        </details>
      </div>
    );
  }
  return <>{children}</>;
}