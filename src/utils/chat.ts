import axios from 'axios'
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
