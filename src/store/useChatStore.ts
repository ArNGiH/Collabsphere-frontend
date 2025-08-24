// store/useChatStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type User = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
};

export type Chat = {
  id: string;
  name: string;
  type: 'private' | 'group';
  participants: User[];
};

interface ChatState {
  chats: Chat[];
  currentChat?: Chat;
  setChats: (chats: Chat[] | undefined) => void;
  setCurrentChat: (chat: Chat | undefined) => void;
  addChat: (chat: Chat) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chats: [],
      currentChat: undefined,
      setChats: (chats) => set({ chats }),
      setCurrentChat: (chat) => set({ currentChat: chat }),
      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
          currentChat: chat,
        })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        chats: state.chats,
        currentChat: state.currentChat,
      }),
    }
  )
);
