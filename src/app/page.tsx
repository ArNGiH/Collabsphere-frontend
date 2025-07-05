'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
export default function Home() {
  const router=useRouter();
  const {isAuthenticated}=useAuthStore();
  useEffect(()=>{
    if (!isAuthenticated) {
      router.push("/auth");
    }else{
      router.push('/chat');
    }

  },[isAuthenticated])
  return (
  <div className='h-full flex items-center justify-center text-center font-semibold text-3xl'>
      Redirecting....
  </div>
  );
}
