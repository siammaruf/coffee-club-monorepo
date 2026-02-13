export function getConfig(key: string): string {
  const rc = (window as any).__RUNTIME_CONFIG__;
  if (rc?.[key]) return rc[key];
  return import.meta.env[key] || '';
}

export const API_URL =
  getConfig('VITE_API_URL') || 'http://localhost:3000/api/v1';
