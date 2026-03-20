import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getConfig } from '~/lib/config';

// Socket.IO expects HTTP(S) URLs — it handles WebSocket upgrade internally
const WS_URL = (getConfig('VITE_API_URL') || 'http://localhost:3000/api/v1')
  .replace('/api/v1', '')
  .replace(/\/+$/, '');

export function useWhatsAppSocket() {
  const [status, setStatus] = useState<string>('unknown');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const socket = io(`${WS_URL}/whatsapp`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setError(null);
    });

    socket.on('connect_error', (err) => {
      setError(`Connection failed: ${err.message}`);
    });

    socket.on('whatsapp:qr', (data: { qr: string }) => {
      setQrCode(data.qr);
      setStatus('SCANNING_QR');
    });

    socket.on('whatsapp:status', (data: { status: string }) => {
      setStatus(data.status);
      if (data.status === 'CONNECTED') {
        setQrCode(null);
      }
    });

    socket.on('whatsapp:error', (data: { error: string }) => {
      setError(data.error);
    });

    socket.on('disconnect', () => {
      setStatus('unknown');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { status, qrCode, error, isConnected: status === 'CONNECTED' };
}
