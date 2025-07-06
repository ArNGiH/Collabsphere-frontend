import { useState ,useRef, useEffect } from "react"
import { GrAttachment } from "react-icons/gr"
import { IoSend } from "react-icons/io5"
import { RiEmojiStickerLine } from "react-icons/ri"
import EmojiPicker, { EmojiClickData ,Theme} from 'emoji-picker-react';
export default function MessageBar(){
    const [message,setMessage]=useState('')
    const emojiRef=useRef<HTMLDivElement>(null);
    const [emojiPickerOpen,setEmojiPickerOpen]=useState<boolean>(false)

    useEffect(()=>{
        function handleClickOutside(event:MouseEvent){
            if(emojiRef.current && !emojiRef.current.contains(event.target as Node)){
                setEmojiPickerOpen(false);
            }  
        }
        document.addEventListener('mousedown',handleClickOutside)

        return ()=>{
            document.removeEventListener('mousedown',handleClickOutside)
        }

    },[emojiRef])

    const handleSendMessage=async()=>{

    }

    const handleAddEmoji=(emoji:EmojiClickData)=>{
        setMessage((msg)=>msg+emoji.emoji)
    }
    return (
        <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-5 gap-6">
            <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                <input type="text" 
                 className='flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none'
                 placeholder="Enter your message"
                 value={message}
                 onChange={(e)=>setMessage(e.target.value)}
                 />

                 <button 
                 className='text-neutral-500 cursor-pointer focus:border-none focus:outline-none focus:text-white duration-300 transition-all'>
                    <GrAttachment className="text-2xl"/>
                 </button>
                 <div className="relative">
                     <button 
                     className='text-neutral-500 cursor-pointer focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
                     onClick={()=>setEmojiPickerOpen(true)}
                     >
                    <RiEmojiStickerLine className="text-2xl"/>
                 </button>
                 </div>
                 <div className="absolute bottom-16 right-0" ref={emojiRef}>
                    <EmojiPicker theme={"dark" as Theme} open={emojiPickerOpen} onEmojiClick={handleAddEmoji} autoFocusSearch={false}/>
                 </div>

            </div>
             <button className=' bg-[#8f17ff] rounded-md flex items-center justify-center p-4  cursor-pointer focus:border-none hover:bg-[#7f1bda] focus:bg-[#7f1bda] focus:outline-none focus:text-white duration-300 transition-all' onClick={handleSendMessage}>
                    <IoSend className="text-2xl"/>
            </button>
        </div>
    )
}