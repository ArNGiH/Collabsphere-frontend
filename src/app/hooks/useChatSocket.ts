'use client';
import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/store/authStore';


type NewMessageEvent = {
  type: 'new_message';
  data: {
    message_id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    media_url?: string;
  media_type?: string;  
    
};
}
type PresenceEvent = {
  type: 'presence_update';
  data: {
    user_id: string;
    is_online: boolean;
    username: string;
    last_seen: string | null;
  };
};
type TypingEvent = {
  type: 'typing_status';
  data: {
    user_id: string;
    username: string;
    is_typing: boolean;
  };
};
type ErrorEvent = { type: 'error'; detail: string };
export type WsEvent =
  | NewMessageEvent
  | PresenceEvent
  | TypingEvent
  | ErrorEvent
  | { type: 'pong'; ts?: number }
  | { type: string; [k: string]: string};

export type ChatMessage = NewMessageEvent['data'];

/** Options */
type UseChatSocketOptions = {
  baseUrl?: string;
  autoReconnect?: boolean;
  reconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  heartbeatMs?: number;
  onEvent?: (evt: WsEvent) => void;
};

type TimeoutId = ReturnType<typeof setTimeout>;
type IntervalId = ReturnType<typeof setInterval>;

export function useChatSocket(chatId: string | null, opts: UseChatSocketOptions = {}) {
  const token = useAuthStore((s) => s.token);
  const {
    baseUrl,
    autoReconnect = true,
    reconnectDelayMs = 1000,
    maxReconnectDelayMs = 8000,
    heartbeatMs = 30000,
    onEvent,
  } = opts;

  /** UI state */
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [typing, setTypingMap] = useState<Record<string, boolean>>({});

  /** Refs */
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<TimeoutId | null>(null);
  const heartbeatTimerRef = useRef<IntervalId | null>(null);
  const typingThrottleRef = useRef<TimeoutId | null>(null);
  const reconnectAttemptRef = useRef(0);
  const manualCloseRef = useRef(false);

  /** Keep onEvent stable */
  const onEventRef = useRef<typeof onEvent>(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  /** Build URL */
  const url = useMemo(() => {
    if (!chatId || !token) return null;

    const proto =
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';

    const host =
      baseUrl ??
      (typeof window !== 'undefined' ? window.location.host : process.env.NEXT_PUBLIC_URL);

    if (baseUrl && (baseUrl.startsWith('ws://') || baseUrl.startsWith('wss://'))) {
      return `${baseUrl.replace(/\/+$/, '')}/ws/chat/${chatId}?token=${encodeURIComponent(token)}`;
    }
    return `${proto}://${host}/ws/chat/${chatId}?token=${encodeURIComponent(token)}`;
  }, [chatId, token, baseUrl]);

  /** Clear timers */
  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (typingThrottleRef.current) {
      clearTimeout(typingThrottleRef.current);
      typingThrottleRef.current = null;
    }
  }, []);

  /** Connect ref so scheduleReconnect can call it without deps churn */
  const connectRef = useRef<() => void>(() => {});

  /** Reconnect with backoff (define BEFORE connect to avoid TDZ) */
  const scheduleReconnect = useCallback(
    (code?: number) => {
      if (!autoReconnect || manualCloseRef.current) return;
      // Don’t retry on auth/permission or normal closes
      if (code === 4401 || code === 4403 || code === 1000 || code === 1001) return;

      const attempt = ++reconnectAttemptRef.current;
      const delay = Math.min(reconnectDelayMs * Math.pow(2, attempt - 1), maxReconnectDelayMs);

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      reconnectTimerRef.current = setTimeout(() => {
        connectRef.current?.();
      }, delay);
    },
    [autoReconnect, reconnectDelayMs, maxReconnectDelayMs]
  );

  /** Connect */
  const connect = useCallback(() => {
    if (!url) return;

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    manualCloseRef.current = false;
    setConnecting(true);
    setLastError(null);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return; // stale
      reconnectAttemptRef.current = 0;
      setConnected(true);
      setConnecting(false);
      setLastError(null);

      if (heartbeatMs > 0) {
        heartbeatTimerRef.current = setInterval(() => {
          try {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ ping: Date.now() }));
            }
          } catch {
            /* ignore */
          }
        }, heartbeatMs);
      }
    };

    ws.onmessage = (evt) => {
      if (wsRef.current !== ws) return; // stale
      let parsed: WsEvent | null = null;
      try {
        parsed = JSON.parse(evt.data);
      } catch {
        return;
      }
      if (!parsed) return;

      onEventRef.current?.(parsed);

      switch (parsed.type) {
        case 'new_message':
          setMessages((prev) => [...prev, (parsed as NewMessageEvent).data]);
          break;
        case 'presence_update': {
          const d = (parsed as PresenceEvent).data;
          setOnline((prev) => ({ ...prev, [d.user_id]: d.is_online }));
          break;
        }
        case 'typing_status': {
          const d = (parsed as TypingEvent).data;
          setTypingMap((prev) => ({ ...prev, [d.user_id]: d.is_typing }));
          if (d.is_typing) {
            const uid = d.user_id;
            setTimeout(() => {
              setTypingMap((p) => ({ ...p, [uid]: false }));
            }, 3000);
          }
          break;
        }
        case 'error':
          setLastError((parsed as ErrorEvent).detail ?? 'WebSocket error');
          break;
        case 'pong':
        default:
          // ignore
          break;
      }
    };

    ws.onclose = (evt) => {
      if (wsRef.current !== ws) return; // stale
      setConnecting(false);
      setConnected(false);
      clearTimers();
      scheduleReconnect(evt.code);
    };

    ws.onerror = () => {
      if (wsRef.current !== ws) return; // stale
      setLastError('WebSocket encountered an error');
    };
  }, [url, heartbeatMs, clearTimers, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  /** Lifecycle */
  useEffect(() => {
    if (!url) return;
    connectRef.current();

    return () => {
      manualCloseRef.current = true;
      clearTimers();
      try {
        wsRef.current?.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
      setConnected(false);
      setConnecting(false);
      setTypingMap({});
      // Clear chat-local state on chat switch (keep if you want history)
      setMessages([]);
      setOnline({});
    };
  }, [url, clearTimers]);
const sendMessage = useCallback(
  (content?: string, media?: { media_url: string; media_type: string }) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    const payload: Record<string, any> = {};
    if (content?.trim()) payload.content = content.trim();
    if (media) {
      payload.media_url = media.media_url;
      payload.media_type = media.media_type;
    }

    if (!payload.content && !payload.media_url) return false;

    ws.send(JSON.stringify(payload));
    return true;
  },
  []
);



  const setTyping = useCallback((isTyping: boolean) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (typingThrottleRef.current) return;
    ws.send(JSON.stringify({ is_typing: !!isTyping }));
    typingThrottleRef.current = setTimeout(() => {
      typingThrottleRef.current = null;
    }, 800);
  }, []);

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    clearTimers();
    try {
      wsRef.current?.close();
    } catch {
      /* ignore */
    }
    wsRef.current = null;
    setConnected(false);
    setConnecting(false);
  }, [clearTimers]);

  const resetMessages = useCallback(() => {
  setMessages([]);
}, []);


  return {
    connected,
    connecting,
    error: lastError,
    messages,
    online,
    typing,
    sendMessage,
    setTyping,
    disconnect,
    resetMessages
  };
}
