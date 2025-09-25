export function getEnv() {
  const env = {
    API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY,
    BASE_ID: import.meta.env.VITE_AIRTABLE_BASE_ID,
    T_USERS: import.meta.env.VITE_AIRTABLE_USERS ?? 'Users',
    T_GRUPOS: import.meta.env.VITE_AIRTABLE_GRUPOS ?? 'Grupos',
    T_SESSOES: import.meta.env.VITE_AIRTABLE_SESSOES ?? 'Sessoes',
  };
  const missing = Object.entries(env)
    .filter(([,v]) => !v || String(v).trim()==='')
    .map(([k])=>k);
  return { env, missing };
}