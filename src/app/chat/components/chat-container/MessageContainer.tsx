'use client';
import type { ChatMessage } from '@/app/hooks/useChatSocket';

export default function MessageContainer({
  messages,
  typing,
  online,
  connected,
  error,
}: {
  messages: ChatMessage[];
  typing: Record<string, boolean>;
  online: Record<string, boolean>;
  connected: boolean;
  error: string | null;
}) {
  const someoneTyping = Object.values(typing).some(Boolean);

  return (
    <div className="flex-1 overflow-y-auto p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full custom-scrollbar">
      {!connected && <div className="text-xs text-neutral-400 mb-2">Connecting…</div>}
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}

      {messages.map((m) => (
        <div key={m.message_id} className="mb-3">
          <div className="text-sm text-neutral-200">{m.content}</div>
          <div className="text-[10px] text-neutral-500">
            {new Date(m.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}

      {someoneTyping && (
        <div className="mt-2 text-xs text-neutral-400 italic">Someone is typing…</div>
      )}
    </div>
  );
}
