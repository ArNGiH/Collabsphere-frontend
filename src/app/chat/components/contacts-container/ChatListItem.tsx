'use client';
import Image from 'next/image';
import { useState,useEffect,useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/authStore';
import fetchCurrentChats from '@/utils/chat';
import { clearChatMessages } from '@/utils/chat';
import type { Chat } from '@/store/useChatStore';
import { mapToStoreChat } from '@/app/hooks/useCurrentChats';
import { getChatHistory } from '@/utils/chat';


export default function ChatListItem({ chat }: { chat: Chat }) {
  const setCurrentChat = useChatStore((s) => s.setCurrentChat);
  const setChats=useChatStore((s)=>s.setChats);

  const token=useAuthStore((s)=>s.token);

  const isPrivate = chat.type === 'private';
  const displayName = isPrivate ? (chat.participants[0]?.name ?? chat.name) : chat.name;
  const avatar = isPrivate ? (chat.participants[0]?.avatarUrl || '/default-avatar.png') : '/group.png';

  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    if (menuOpen) {
        document.addEventListener("mousedown", onDocClick);
      }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

   const handleOpenChat = () => setCurrentChat(chat);

   const handleDelete=async()=>{
    if(!token){
      return ;
    }
    const ok = confirm(`Clear Chat with "${displayName}"? This cannot be undone.`);
    if (!ok) return;

    try {
       setBusy(true);
       await clearChatMessages(chat.id);
       const isOpenChatCleared = useChatStore.getState().currentChat?.id === chat.id;
       if (isOpenChatCleared) {
    try { await getChatHistory(chat.id); } catch {}
      window.dispatchEvent(
      new CustomEvent('chat:cleared', { detail: { chatId: chat.id } })
    );
  }
        const data = await fetchCurrentChats(token);
         const mapped = (data ?? []).map(mapToStoreChat);
      if (Array.isArray(mapped)) setChats(mapped);
      
    } catch (e) {
       console.error('Failed to delete chat', e);
      alert('Could not delete this chat. Please try again.');
      
    }
    finally{
      setBusy(false);
      setMenuOpen(false);

    }

   }


  return (
    <div
      className="flex items-center cursor-pointer gap-3 px-4 py-2 hover:bg-[#2a2b33] rounded-lg transition-all"
      role="button"
      tabIndex={0}
      onClick={handleOpenChat}
      onKeyDown={(e) => e.key === 'Enter' && handleOpenChat()}
    >
      <Image
        src={avatar}
        alt={displayName}
        width={36}
        height={36}
        className="rounded-full object-cover flex-shrink-0"
      />

      <p className="text-sm font-medium text-white truncate flex-1">{displayName}</p>
      <div className="relative" onClick={(e) => e.stopPropagation()} ref={menuRef}>
        <button
          type="button"
          className="p-1.5 rounded cursor-pointer hover:bg-[#3a3b44] focus:outline-none focus:ring-2 focus:ring-violet-700"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          disabled={busy}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="fill-neutral-300">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-40 rounded-md bg-[#1f2028] border border-[#2d2e36] shadow-lg overflow-hidden"
          >
            <button
              className="w-full text-lef cursor-pointer px-3 py-2 text-sm text-red-300 hover:bg-[#2a2b33] disabled:opacity-50"
              onClick={handleDelete}
              disabled={busy}
              role="menuitem"
            >
              {busy ? 'Clearing…' : 'Clear chat'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
