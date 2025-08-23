
'use client';
import ChatHeader from './ChatHeader';
import MessageBar from './MessageBar';
import MessageContainer from './MessageContainer';
import { useChatSocket } from '@/app/hooks/useChatSocket';
import { useChatStore } from '@/store/useChatStore';
import { useCallback } from 'react';
import { WsEvent } from '@/app/hooks/useChatSocket';

export default function ChatContainer() {
  const chatId = useChatStore((s) => s.currentChat?.id ?? null);

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
      <div className="flex-1 flex flex-col">
        <MessageContainer 
        messages={socket.messages}
        typing={socket.typing}
        online={socket.online}
        connected={socket.connected}
        error={socket.error}
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
