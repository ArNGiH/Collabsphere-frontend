import { RiCloseFill } from 'react-icons/ri'
export default function ChatHeader(){
    return (
        <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between">
            <div className="flex gap-5 items-center">
                <div className="flex gap-3 items-center justify-center">Chat Name</div>
                <div className="flex items-center justify-center gap-5">
                    <button className='text-neutral-500 cursor-pointer focus:border-none focus:outline-none focus:text-white duration-300 transition-all'>
                        <RiCloseFill className='text-3xl'/>
                    </button>
                </div>
            </div>
        </div>
    )
}