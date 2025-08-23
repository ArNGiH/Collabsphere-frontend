'use client';
import Image from 'next/image';
import { useChatStore } from '@/store/useChatStore';

type User = { id: string; name: string; email?: string; avatarUrl?: string | null; };
type Chat = { id: string; name: string; type: 'private' | 'group'; participants: User[]; };

export default function ChatListItem({ chat }: { chat: Chat }) {
  const setCurrentChat = useChatStore((s) => s.setCurrentChat);

  const isPrivate = chat.type === 'private';
  const displayName = isPrivate ? (chat.participants[0]?.name ?? chat.name) : chat.name;
  const avatar = isPrivate ? (chat.participants[0]?.avatarUrl || '/default-avatar.png') : '/group.png';

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 hover:bg-[#2a2b33] cursor-pointer transition-all rounded-lg"
      onClick={() => setCurrentChat(chat)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setCurrentChat(chat)}
    >
      <Image src={avatar} alt={displayName} width={36} height={36} className="rounded-full object-cover" />
      <p className="text-sm font-medium text-white truncate">{displayName}</p>
    </div>
  );
}
