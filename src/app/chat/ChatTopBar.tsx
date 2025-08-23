'use client';
import NewChatBar from './components/chat-container/NewChatBar';
import { useAuthStore } from '@/store/authStore';
import { searchUsers } from '@/utils/users';
import { createNewChat, type CreateChatPayload } from '@/utils/chat';
import { useCallback } from 'react';

export default function ChatTopBar() {
  const token = useAuthStore((s) => s.token);


  const fetchUsers = useCallback((q: string) => searchUsers(q, token), [token]);
  const createChat = useCallback(
    (payload: CreateChatPayload) => createNewChat(payload, token),
    [token]
  );

  return (
    <div className="border-b border-[#2f303b] bg-[#1c1d25]">
      <NewChatBar fetchUsers={fetchUsers} createChat={createChat} />
    </div>
  );
}
