import Image from "next/image";
import Title from "./Title";
import ProfileInfo from "./ProfileInfo";
import { useCurrentChats } from "@/app/hooks/useCurrentChats";
import ChatListItem from "./ChatListItem";

export default function ContactsContainer() {
  const { data: chats, isLoading, isError } = useCurrentChats();

  const privateChats = chats?.filter((chat) => chat.type === "private") || [];
  const groupChats = chats?.filter((chat) => chat.type === "group") || [];

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3 mt-3">
        <div className="flex flex-row w-full justify-center items-center mb-2">
          <h1 className="text-3xl font-bold items-center text-center mr-2">
            CollabSphere
          </h1>
          <Image src="/chat.png" alt="App Logo" width={40} height={40} />
        </div>
      </div>

      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Messages" />
        </div>
        {isLoading && (
          <p className="text-xs text-gray-400 pl-10 mt-1">Loading...</p>
        )}
        {isError && (
          <p className="text-xs text-red-500 pl-10 mt-1">
            Failed to load chats.
          </p>
        )}
        {!isLoading &&
          !isError &&
          privateChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
      </div>

      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Group Chats" />
        </div>
        {!isLoading &&
          !isError &&
          groupChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
      </div>

      <ProfileInfo />
    </div>
  );
}
