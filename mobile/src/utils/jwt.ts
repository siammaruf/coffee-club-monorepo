export interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  role?: string;
  rememberMe?: boolean;
  [key: string]: any;
}

function base64UrlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = 4 - (base64.length % 4);
    const padded = padLength === 4 ? base64 : base64 + '='.repeat(padLength);
    // atob decodes base64 to a binary string. JWT payloads are normally ASCII-safe JSON
    // (non-ASCII chars are \u-escaped), so atob is sufficient and widely supported.
    return atob(padded);
  } catch {
    return '';
  }
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = base64UrlDecode(parts[1]);
    if (!json) return null;
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string, bufferSeconds = 300): boolean => {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - bufferSeconds <= now;
};
