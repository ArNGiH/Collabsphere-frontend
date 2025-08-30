// components/chat-container/MessageBar.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { uploadMedia } from "@/utils/chat";
import { useChatStore } from "@/store/useChatStore";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

export default function MessageBar({
  onSend,
  onTyping,
  disabled,
}: {
  onSend: (
    text?: string,
    media?: { media_url: string; media_type: string }
  ) => boolean | void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const { currentChat } = useChatStore();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddEmoji = (emoji: EmojiClickData) => {
    setMessage((m) => m + emoji.emoji);
  };
const send = async () => {
  const text = message.trim();
  if ((!text && !pendingFile) || disabled) return;

  try {
    if (pendingFile && currentChat?.id) {
      const uploaded = await uploadMedia({
        file: pendingFile,
        chatId: currentChat.id,
        content: text || "", // keep text with file
      });

      // ✅ Send only once (with file + optional text)
      onSend(text || undefined, uploaded);
      setPendingFile(null);
      setMessage(""); // reset only here
    } else {
      // ✅ Only send plain text if no file
      const ok = onSend(text);
      if (ok !== false) setMessage("");
    }
  } catch (err) {
    console.error("Send failed", err);
  } finally {
    onTyping(false);
  }
};



  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-5 gap-6">


      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none disabled:opacity-50"
          placeholder="Enter your message"
          value={message}
          disabled={disabled}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />

        <input
          type="file"
          id="fileInput"
          className="hidden"
          multiple={false}
          onChange={(e) => {
            if (e.target.files?.[0]) setPendingFile(e.target.files[0]);
          }}
        />
        {pendingFile && (
  <div className="ml-2 text-xs text-neutral-400 truncate max-w-[150px]">
    📎 {pendingFile.name}
  </div>
)}
        <button
          onClick={() => document.getElementById("fileInput")?.click()}
          disabled={disabled}
          className="text-neutral-500 cursor-pointer hover:text-white disabled:opacity-50 transition-all"
        >
          <GrAttachment className="text-2xl" />
        </button>

        <div className="relative">
          <button
            disabled={disabled}
            onClick={() => setEmojiPickerOpen((v) => !v)}
            className="text-neutral-500 cursor-pointer focus:outline-none hover:text-white disabled:opacity-50 transition-all"
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme={"dark" as Theme}
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>

      <button
        disabled={disabled}
        onClick={send}
        className="bg-blue-600  cursor-pointer rounded-md flex items-center justify-center p-4 hover:bg-blue-900 disabled:opacity-50 transition-all"
      >
        <IoSend className="text-2xl" />
      </button>

      
    </div>
  );
}
