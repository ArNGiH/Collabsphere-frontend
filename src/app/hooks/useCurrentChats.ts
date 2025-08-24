
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import fetchCurrentChats, { CurrentChatsResponse } from '@/utils/chat';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/useChatStore'; 

const mapToStoreChat = (api: CurrentChatsResponse) => ({
  id: api.id,
  name: api.display_name,            
  type: api.type,        
  participants: (api.participants ?? []).map((p) => ({
    id: p.id,
    name: p.display_name,
    email: undefined,
    avatarUrl: p.avatar_url ?? null,
  })),
});

export const useCurrentChats = () => {
  const token = useAuthStore((s) => s.token);
  const setChats = useChatStore((s) => s.setChats);

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentChats(token); // should return CurrentChatsResponse[] (or [])
      if (!mounted.current) return;
      const mapped = (data ?? []).map(mapToStoreChat);
      setChats(mapped);
    } catch (err) {
      console.error(err);
      if (!mounted.current) return;
      setError('Failed to load chats');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [token, setChats]);

  useEffect(() => {
    mounted.current = true;
    if (token) load();
    return () => { mounted.current = false; };
  }, [token, load]);

  return { loading, error, refresh: load };
};
