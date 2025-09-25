import { useAuth } from '@/contexts/AuthContext';

export default function DebugOverlay(){
  const params = new URLSearchParams(location.search);
  const { user, loading } = useAuth();
  
  if (params.get('debug') !== '1') return null;
  
  return (
    <div style={{
      position:'fixed',
      bottom:16,
      right:16,
      background:'rgba(0,0,0,.8)',
      color:'#fff',
      padding:'12px 16px',
      borderRadius:8,
      zIndex:9999,
      fontSize:'12px',
      fontFamily:'monospace',
      maxWidth:'300px'
    }}>
      <div><strong>Debug Info</strong></div>
      <div>ENV API_KEY: {String(!!import.meta.env.VITE_AIRTABLE_API_KEY)}</div>
      <div>ENV BASE_ID: {String(!!import.meta.env.VITE_AIRTABLE_BASE_ID)}</div>
      <div>Auth loading: {String(loading)}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Role: {user?.role || 'none'}</div>
      <div>Location: {location.pathname}</div>
    </div>
  );
}