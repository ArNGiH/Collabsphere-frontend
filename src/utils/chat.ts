import axios from 'axios'
const SERVER=process.env.NEXT_PUBLIC_URL;
type CurrentChatsResponse={
    id:string,
    name:string,
    type:string,
    created_at:string,
    updated_at:string,
    other_user_id:string,
    other_user_image:string,
    other_user_name:string
}

const fetchCurrentChats=async(token:string):Promise<CurrentChatsResponse[] | null>=>{
    try {
        const response=axios.get(`${SERVER}/chat/current-chats`,{
            headers:{
                Authorization:`Bearer ${token}`
            },
        });
        return (await response).data;
        
    } catch (e) {
        console.log("An error occoured in fetching the current chat",e)
        return null;
        
    }
}
export default fetchCurrentChats;