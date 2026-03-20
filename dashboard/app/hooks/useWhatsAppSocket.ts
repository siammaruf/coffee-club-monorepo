import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getConfig } from '~/lib/config';
import { whatsappService } from '~/services/httpServices/whatsappService';

export function useWhatsAppSocket() {
  const [status, setStatus] = useState<string>('unknown');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Compute URL on client only — module scope runs during SSR where window is undefined
    const apiUrl = getConfig('VITE_API_URL') || 'http://localhost:3000/api/v1';
    const wsUrl = apiUrl.replace('/api/v1', '').replace(/\/+$/, '');

    const socket = io(`${wsUrl}/whatsapp`, {
      path: '/api/v1/ws',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: (cb) => {
        const token = localStorage.getItem('token');
        cb(token ? { token } : {});
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setError(null);
      setSocketConnected(true);
    });

    socket.on('connect_error', () => {
      setError(`WebSocket connection failed. Trying alternative connection...`);
      setSocketConnected(false);
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
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Polling fallback — only when WebSocket is not connected
  useEffect(() => {
    if (socketConnected) return;

    let active = true;

    const poll = async () => {
      try {
        const res = (await whatsappService.getPendingQr()) as any;
        const data = res?.data || res;
        if (!active) return;
        if (data?.qr) {
          setQrCode(data.qr);
          setStatus('SCANNING_QR');
        } else if (data?.status) {
          setStatus(data.status);
          if (data.status === 'CONNECTED') {
            setQrCode(null);
          }
        }
      } catch {
        // polling error — will retry on next interval
      }
    };

    const interval = setInterval(poll, 3000);
    poll();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [socketConnected]);

  return { status, qrCode, error, isConnected: status === 'CONNECTED', socketConnected };
}
