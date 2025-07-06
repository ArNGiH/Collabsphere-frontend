'use client'
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
const ProfileInfo=()=>{
    const {user,clearAuth}=useAuthStore()
    const router=useRouter();
    const handleLogout=()=>{
    clearAuth(); 
    sessionStorage.removeItem("auth");
    router.push("/auth"); 
    }
    if(!user){
        return null;
    }
    return (
        <div className=" bg-[#2a2b33] absolute bottom-0 h-16 flex items-center justify-between px-10 w-full">
            <div className="flex gap-3 items-center justify-center">
               <Image
                src={user.profile_image || '/default-avatar.png'}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full object-cover"
                />
                <div className="flex flex-col text-white">
                    <p className="text-sm text-white font-medium">{user.full_name}</p>
                    <p className="text-xs text-gray-400">{user.username}</p>
                </div>
            </div>
            <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-200"
            title="Logout"
            >
            <FiLogOut className="text-2xl"></FiLogOut>
               
            </button>

        </div>
    )
}
export default ProfileInfo;