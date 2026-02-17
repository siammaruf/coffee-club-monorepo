const isServer = typeof window === 'undefined'

export function getConfig(key: string): string {
  if (!isServer) {
    const rc = (window as unknown as { __RUNTIME_CONFIG__?: Record<string, string> })
      .__RUNTIME_CONFIG__
    if (rc?.[key]) return rc[key]
  }
  // import.meta.env is available in both client and SSR (Vite injects it)
  return (import.meta.env[key] as string) || ''
}

export const API_URL =
  getConfig('VITE_API_URL') || 'http://localhost:3000/api/v1'
