import { useQuery } from "@tanstack/react-query";
import fetchCurrentChats from "@/utils/chat";
import { useAuthStore } from "@/store/authStore";

export const useCurrentChats=()=>{
    const token=useAuthStore((state)=>state.token);

    return useQuery({
        queryKey:['currentChats'],
        queryFn:()=>fetchCurrentChats(token!),
        enabled:!!token
    })
};