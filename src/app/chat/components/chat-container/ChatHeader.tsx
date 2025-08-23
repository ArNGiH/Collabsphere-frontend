'use client';
import { RiCloseFill } from 'react-icons/ri';
import { useChatStore } from '@/store/useChatStore';

export default function ChatHeader() {
  const { currentChat, setCurrentChat } = useChatStore();

  return (
    <div className="h-[64px] min-h-[64px] flex items-center justify-between px-4 bg-[#1c1d25] border-b-2 border-[#2f303b]">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {(currentChat?.participants ?? []).slice(0, 3).map((u) => (
            <div
              key={u.id}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1c1d25] bg-[#2f303b] text-sm"
              title={u.name}
            >
              {u.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          ))}
          {currentChat && currentChat.participants.length > 3 && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1c1d25] bg-[#2f303b] text-xs text-neutral-300">
              +{currentChat.participants.length - 3}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-neutral-100 font-medium leading-tight">
            {currentChat?.name ?? 'Chat'}
          </div>
          <div className="text-xs text-neutral-500">
            {currentChat
              ? currentChat.type === 'group'
                ? `${currentChat.participants.length} participants`
                : currentChat.participants[0]?.email ?? 'Private chat'
              : 'No chat selected'}
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrentChat(undefined)}
        className="text-neutral-500 hover:text-white transition-colors"
        aria-label="Close chat"
      >
        <RiCloseFill className="text-3xl" />
      </button>
    </div>
  );
}
