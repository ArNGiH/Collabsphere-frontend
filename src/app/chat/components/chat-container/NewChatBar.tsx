"use client";
import React, { useEffect, useMemo, useState ,useRef } from "react";
import { useChatStore } from "@/store/useChatStore";

type User = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
};

type CreateChatPayload = {
  name: string;
  type: "private" | "group";
  participant_ids: string[];
};

type NewChatBarProps = {
  fetchUsers: (q: string) => Promise<User[]>;
  createChat: (payload: CreateChatPayload) => Promise<{ id: string }>;
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function NewChatBar({
  fetchUsers,
  createChat,
}: NewChatBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [selected, setSelected] = useState<User[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number>(-1);
  const [creating, setCreating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);   
   const hasFetchedOnFocus = useRef(false);     

  const isGroup = selected.length > 1;
  const defaultGroupName = useMemo(() => {
    if (!isGroup) return "";
    const names = selected.map((u) => u.name);
    return (
      names.slice(0, 3).join(", ") +
      (names.length > 3 ? ` +${names.length - 3}` : "")
    );
  }, [selected, isGroup]);

  const [groupName, setGroupName] = useState("");
  useEffect(() => {
    setGroupName(defaultGroupName);
  }, [defaultGroupName]);

   const handleFocus = async () => {
    setOpenList(true);
    setIsFocused(true);
    if (hasFetchedOnFocus.current) return;
    hasFetchedOnFocus.current = true;
    setLoading(true);
    try {
      const data = await fetchUsers("");      
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const { setCurrentChat, addChat } = useChatStore();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!isFocused && debouncedQuery === "") return;

      setLoading(true);
      try {
        const data = await fetchUsers(debouncedQuery);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [debouncedQuery, isFocused, fetchUsers]);


  const toggleUser = (u: User) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === u.id);
      return exists ? prev.filter((p) => p.id !== u.id) : [...prev, u];
    });
    setQuery("");
    setResults([]);
    setOpenList(false);
    setFocusedIdx(-1);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!openList && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpenList(true);
      return;
    }
    if (!openList || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = focusedIdx >= 0 ? focusedIdx : 0;
      const u = results[idx];
      if (u) toggleUser(u);
    } else if (e.key === "Escape") {
      setOpenList(false);
      setFocusedIdx(-1);
    }
  };

  const canCreate =
    selected.length === 1 ||
    (selected.length > 1 && groupName.trim().length > 0);

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      const payload: CreateChatPayload =
        selected.length === 1
          ? {
              name: selected[0].name,
              type: "private",
              participant_ids: [selected[0].id],
            }
          : {
              name: groupName.trim(),
              type: "group",
              participant_ids: selected.map((s) => s.id),
            };

      const res = await createChat(payload);

      const newChat = {
        id: res.id,
        name: payload.name,
        type: payload.type,
        participants: selected,
      };
      addChat(newChat);
      setCurrentChat(newChat);

      // Reset UI
      setSelected([]);
      setGroupName("");
      setQuery("");
      setResults([]);
      setOpenList(false);
      setFocusedIdx(-1);
    } catch (err) {
      console.error("Failed to create chat", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full bg-[#1c1d25] border-b border-[#2f303b]">
      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {selected.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-2 rounded-full bg-[#2a2b35] px-3 py-1 text-sm text-neutral-200"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#353643] text-xs">
                  {u.name?.[0]?.toUpperCase() ?? "U"}
                </span>
                {u.name}
                <button
                  onClick={() => toggleUser(u)}
                  className="ml-1 text-neutral-400 hover:text-neutral-200"
                  aria-label={`Remove ${u.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1">
            <input
              value={query}
         
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenList(true);
              }}
              onFocus={() => handleFocus}
              onKeyDown={handleKeyDown}
              placeholder={
                selected.length
                  ? "Add more people…"
                  : "Search people to start a chat…"
              }
              className="w-full rounded-lg bg-[#23242d] px-4 py-2 text-neutral-100 placeholder:text-neutral-500 outline-none ring-1 ring-transparent focus:ring-[#3a3b47]"
            />
            {openList &&
              (loading || results.length > 0 || debouncedQuery.length >= 2) && (
                <ul
                  role="listbox"
                  className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-[#2f303b] bg-[#1b1c23] shadow-lg"
                >
                  {loading && (
                    <li className="px-4 py-3 text-sm text-neutral-400">
                      Searching…
                    </li>
                  )}
                  {!loading &&
                    results.length === 0 &&
                    debouncedQuery.length >= 2 && (
                      <li className="px-4 py-3 text-sm text-neutral-500">
                        No matches
                      </li>
                    )}
                  {!loading &&
                    results.map((u, i) => {
                      const active = i === focusedIdx;
                      return (
                        <li
                          key={u.id}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setFocusedIdx(i)}
                          onMouseLeave={() => setFocusedIdx(-1)}
                          onClick={() => toggleUser(u)}
                          className={`cursor-pointer px-4 py-2 text-sm ${
                            active ? "bg-[#262735]" : "hover:bg-[#22232d]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#303142] text-xs">
                              {u.name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-neutral-100">{u.name}</span>
                              {u.email && (
                                <span className="text-xs text-neutral-400">
                                  {u.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
          </div>
          <button
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className="rounded-lg bg-[#3e7cff] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#356ef0] transition-colors"
          >
            {creating
              ? "Creating…"
              : selected.length <= 1
              ? "Start chat"
              : "Start group"}
          </button>
        </div>

        {isGroup && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-400">Group name</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Name your group"
              className="flex-1 rounded-lg bg-[#23242d] px-3 py-2 text-neutral-100 placeholder:text-neutral-500 outline-none ring-1 ring-transparent focus:ring-[#3a3b47]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
