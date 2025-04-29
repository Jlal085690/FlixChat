import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

type WebSocketContextType = {
  connected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // تأكد من وجود مستخدم قبل الاتصال
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // لا تعيد الاتصال إذا كان الاتصال مفتوحاً بالفعل
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    // تنظيف الاتصال السابق إذا وجد
    if (socketRef.current) {
      socketRef.current.close();
    }

    // إنشاء اتصال جديد مع إرسال معرف المستخدم
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // إضافة معرف المستخدم كمعامل في عنوان URL
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;

    let pingInterval: number | undefined;

    try {
      console.log("إنشاء اتصال WebSocket جديد:", wsUrl);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // عند فتح الاتصال
      socket.onopen = () => {
        console.log("تم فتح اتصال WebSocket");
        setConnected(true);

        // إرسال معلومات المصادقة
        if (user?.id) {
          socket.send(JSON.stringify({
            type: "auth",
            userId: user.id
          }));
        }
      };

      // عند استلام رسالة
      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          console.error("خطأ في تحليل رسالة WebSocket:", error);
        }
      };

      // عند إغلاق الاتصال
      socket.onclose = () => {
        console.log("تم إغلاق اتصال WebSocket");
        setConnected(false);
      };

      // عند حدوث خطأ
      socket.onerror = (error: Event) => {
        console.error("خطأ في WebSocket:", error);
      };

      // إرسال نبضات للحفاظ على الاتصال
      pingInterval = window.setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    } catch (error) {
      console.error("فشل في إنشاء اتصال WebSocket:", error);
    }

    // تنظيف الاتصال عند إزالة المكون
    return () => {
      if (pingInterval) {
        window.clearInterval(pingInterval);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  // وظيفة لإرسال رسائل عبر WebSocket
  const sendMessage = (message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket غير متصل");
    }
  };

  return (
    <WebSocketContext.Provider value={{ connected, sendMessage, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("يجب استخدام useWebSocket داخل WebSocketProvider");
  }
  return context;
}