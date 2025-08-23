'use client'
import ChatTopBar from "./ChatTopBar";
import ContactsContainer from "./components/contacts-container/ContactsContainer";
import EmptyChatContainer from "./components/empty-chat-container-/EmptyChat";
import { useChatStore } from "@/store/useChatStore";
import ChatContainer from "./components/chat-container/ChatContainer";

export default function ChatController() {
 const currentChatId = useChatStore((s) => s.currentChat?.id || null);

  return (
    <div className="flex w-screen h-screen text-white overflow-hidden">
      <ContactsContainer />
        <div className="flex-1 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] bg-[#1c1d25] flex flex-col">
        <ChatTopBar />
        {currentChatId ? <ChatContainer /> : <EmptyChatContainer />}
      </div>
    </div>
  );
}
