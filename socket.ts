
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

const RECONNECT_INTERVAL = 3000;
const MAX_RETRIES = 5;

export function createWebSocket(url: string) {
  const ws = new WebSocket(url);
  return ws;
}

export function useWebSocket() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);

  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      if (retriesRef.current >= MAX_RETRIES) {
        console.error('تجاوز الحد الأقصى لمحاولات إعادة الاتصال');
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;

      const ws = createWebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('تم فتح اتصال WebSocket');
        retriesRef.current = 0;
      };

      ws.onclose = () => {
        console.log('تم إغلاق اتصال WebSocket');
        setTimeout(() => {
          retriesRef.current++;
          connectWebSocket();
        }, RECONNECT_INTERVAL);
      };

      ws.onerror = (error) => {
        console.error('خطأ في اتصال WebSocket:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  return wsRef;
}
