import axios from 'axios'
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage } from '@/app/hooks/useChatSocket';
const SERVER=process.env.NEXT_PUBLIC_URL;
export type ParticipantMini = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export type CurrentChatsResponse = {
  id: string;
  type: 'private' | 'group';
  display_name: string;    
  name: string | null;       
  participants: ParticipantMini[];
  created_at: string;
};

const fetchCurrentChats=async(token:string | null):Promise<CurrentChatsResponse[] | null>=>{
    try {
        const response=axios.get(`${SERVER}/chat/current-chats`,{
            headers:{
                Authorization:`Bearer ${token}`
            },
        });
        return (await response).data;
        
    } catch (e) {
        console.log("An error occoured in fetching the current chat",e)
        return [];
        
    }
}
export default fetchCurrentChats;


// utils/api/chat.ts
export type CreateChatPayload = {
  name: string;
  type: 'private' | 'group';
  participant_ids: string[];
};

export async function createNewChat(payload: CreateChatPayload, token: string | null): Promise<{ id: string }> {
  const res = await fetch(`${SERVER}/chat/create-new-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!res.ok) throw new Error(`Create chat failed: ${res.status}`);
  return res.json();
}



/************************************************************************************************* */

export type ChatHistoryItem = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;      
  is_edited: boolean;
  sender_name: string | null;
  sender_image: string | null;
  media_type: string | null;
  media_url: string | null;
};

export function toChatMessage(i: ChatHistoryItem): ChatMessage {
  return {
    message_id: i.id,
    chat_id: i.chat_id,
    sender_id: i.sender_id,
    content: i.content,
    created_at: i.created_at,
  };
}

export async function getChatHistory(
  chatId: string | undefined,
  opts?: {
    mapToWsShape?: boolean;
  }
): Promise<ChatHistoryItem[] | ChatMessage[]> {
  const token  = useAuthStore.getState().token;
  if (!token) throw new Error('Missing auth token');
  
  if(!chatId){
    return [];
  }

  const url = `${SERVER}/chat/history/${encodeURIComponent(chatId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`getChatHistory ${res.status}: ${text || res.statusText}`);
  }

  const data = (await res.json()) as ChatHistoryItem[];

  if (opts?.mapToWsShape === false) return data;
  return data.map(toChatMessage);
}

/************************************************************************************************ */

export async function clearChatMessages(chatId: string): Promise<string> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Missing auth token');
  if (!chatId) throw new Error('Missing chatId');

  const url = `${SERVER}/chat/clear-messages/${encodeURIComponent(chatId)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`clearChatMessages ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  return data;
}