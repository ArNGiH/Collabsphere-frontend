
'use client';
import ChatHeader from './ChatHeader';
import MessageBar from './MessageBar';
import MessageContainer from './MessageContainer';
import { useChatSocket } from '@/app/hooks/useChatSocket';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/authStore';
import { useCallback } from 'react';
import { WsEvent } from '@/app/hooks/useChatSocket';

export default function ChatContainer() {
  const chatId = useChatStore((s) => s.currentChat?.id ?? null);
  const userId= useAuthStore((s)=>s.user?.id)

  const handleEvent = useCallback((e: WsEvent) => {
  console.log("WS:", e);
}, []);


   const socket = useChatSocket(chatId, {
    baseUrl:"ws://localhost:8000",
    onEvent: handleEvent,
  });

  return (
    <>
      <ChatHeader />
      <div className="flex-1 flex flex-col min-h-0">
        <MessageContainer 
        messages={socket.messages}
        typing={socket.typing}
        online={socket.online}
        connected={socket.connected}
        error={socket.error}
        myUserId={userId}
         />
        <MessageBar
        onSend={socket.sendMessage}
        onTyping={socket.setTyping}
        disabled={!socket.connected}

         />
      </div>
    </>
  );
}
