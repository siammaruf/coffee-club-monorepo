import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getConfig } from '~/lib/config';

const WS_URL = (getConfig('VITE_API_URL') || 'http://localhost:3000/api/v1').replace('/api/v1', '');

export function useWhatsAppSocket() {
  const [status, setStatus] = useState<string>('unknown');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${WS_URL}/whatsapp`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setError(null);
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
