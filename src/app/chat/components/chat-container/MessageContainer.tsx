"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/app/hooks/useChatSocket";
import { useChatStore } from "@/store/useChatStore";
import { getChatHistory } from "@/utils/chat";

type MessageProps = {
  messages: ChatMessage[];
  typing: Record<string, boolean>;
  online: Record<string, boolean>;
  connected: boolean;
  error: string | null;
  myUserId: string | undefined;
};

export default function MessageContainer({
  messages,
  typing,
  online,
  connected,
  error,
  myUserId,
}: MessageProps) {
  const chatId = useChatStore((s) => s.currentChat?.id);
  const [history, setHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        if (!chatId) {
          setHistory([]);
          return;
        }
        const data = (await getChatHistory(chatId)) as ChatMessage[];
        console.log(data);
        setHistory(data);
      } catch (error) {
        console.error("An error occoured while fetching chat history", error);
      }
    };

    void fetchChatHistory();
  }, [chatId]);

  const mergedMessages = useMemo(() => {
    const seen = new Set<string>();
    const out: ChatMessage[] = [];
    for (const m of [...history, ...messages]) {
      if (!seen.has(m.message_id)) {
        seen.add(m.message_id);
        out.push(m);
      }
    }
    return out;
  }, [history, messages]);

  const someoneTyping = useMemo(() => {
    return Object.entries(typing).some(([uid, is]) => uid !== myUserId && is);
  }, [typing, myUserId]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  return (
    <div className="flex-1 overflow-y-auto p-4 px-4 md:px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full custom-scrollbar">
      {!connected && (
        <div className="text-xs text-neutral-400 mb-2">Connecting…</div>
      )}
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}

      <div className="flex flex-col gap-2">
        {mergedMessages.map((m) => {
          const isMine = m.sender_id === myUserId;
          const aligned = isMine ? "justify-end" : "justify-start";
          const bubble = isMine
            ? "bg-blue-600 text-white rounded-l-2xl rounded-br-2xl"
            : "bg-neutral-800 text-neutral-100 rounded-r-2xl rounded-bl-2xl";
          const timeAlign = isMine ? "text-right pr-1" : "text-left pl-1";

          return (
            <div key={m.message_id} className={`flex ${aligned}`}>
              <div className="max-w-[78%] sm:max-w-[70%]">
                {!isMine && (
                  <div className="flex items-center gap-1 mb-1 pl-1">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        online[m.sender_id]
                          ? "bg-emerald-500"
                          : "bg-neutral-500"
                      }`}
                      title={online[m.sender_id] ? "Online" : "Offline"}
                    />
                  </div>
                )}

                <div className={`px-3 py-2 ${bubble} shadow-sm`}>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {m.content}
                  </div>
                </div>
                <div
                  className={`mt-1 text-[10px] text-neutral-500 ${timeAlign}`}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {someoneTyping && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 text-neutral-300 rounded-r-2xl rounded-bl-2xl px-3 py-2 text-xs italic">
              Someone is typing…
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
