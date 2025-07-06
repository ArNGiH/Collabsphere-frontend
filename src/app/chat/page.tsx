'use client'
// import { useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { toast } from "react-toastify"
import { useState } from "react";
import ContactsContainer from "./components/contacts-container/ContactsContainer";
import EmptyChatContainer from "./components/empty-chat-container-/EmptyChat";
import ChatContainer from "./components/chat-container/ChatContainer";

export default function ChatController() {
  const [selectedChatId, ] = useState<string | null>('1'); // demo purpose

  return (
    <div className="flex w-screen h-screen text-white overflow-hidden">
      <ContactsContainer />
      {selectedChatId ? <ChatContainer /> : <EmptyChatContainer />}
    </div>
  );
}
