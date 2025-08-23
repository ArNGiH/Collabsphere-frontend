"use client";
import Image from "next/image";
import Title from "./Title";
import ProfileInfo from "./ProfileInfo";
import ChatListItem from "./ChatListItem";
import { useCurrentChats } from "@/app/hooks/useCurrentChats";
import { useChatStore } from "@/store/useChatStore";

export default function ContactsContainer() {
  const { loading, error } = useCurrentChats();
  const chats = useChatStore((s) => s.chats);

  const privateChats = chats.filter((c) => c.type === "private");
  const groupChats = chats.filter((c) => c.type === "group");

  return (
    <div
      className="
        relative w-full md:w-[35vw] lg:w-[30vw] xl:w-[20vw]
        h-screen                   
        bg-[#1b1c24] border-r-2 border-[#2f303b]
        flex flex-col              
      "
    >
      {/* Header */}
      <div className="pt-3 mt-3">
        <div className="flex w-full justify-center items-center mb-2">
          <h1 className="text-3xl font-bold mr-2">CollabSphere</h1>
          <Image src="/chat.png" alt="App Logo" width={40} height={40} />
        </div>
      </div>

      {/* Scrollable list area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text="Direct Messages" />
          </div>
          {loading && (
            <p className="text-xs text-gray-400 pl-10 mt-1">Loading...</p>
          )}
          {error && (
            <p className="text-xs text-red-500 pl-10 mt-1">{error}</p>
          )}
          {!loading &&
            !error &&
            privateChats.map((chat) => <ChatListItem key={chat.id} chat={chat} />)}
        </div>

        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text="Group Chats" />
          </div>
          {!loading &&
            !error &&
            groupChats.map((chat) => <ChatListItem key={chat.id} chat={chat} />)}
        </div>
      </div>

    
      <ProfileInfo />
    </div>
  );
}
