import Image from "next/image"
import Title from "./Title"
import ProfileInfo from "./ProfileInfo"
export default function ContactsContainer(){
    return (
        <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
            <div className="pt-3 mt-3">
                 <div className="flex flex-row w-full justify-center items-center mb-2">
                        <h1 className="text-3xl font-bold items-center text-center mr-2">CollabSphere</h1>
                        <Image src='/chat.png' alt='App Logo' width={40} height={40} ></Image>
                 </div>
            </div>
            <div className="my-5 ">
                <div className="flex items-center justify-between pr-10">
                    <Title text='Direct Messages'></Title>
                </div>
            </div>
            <div className="my-5 ">
                <div className="flex items-center justify-between pr-10">
                    <Title text='Group Chats'></Title>
                </div>
            </div>

            <ProfileInfo/>

        </div>
    )
}

