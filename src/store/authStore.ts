import {create} from 'zustand'
import { persist ,createJSONStorage } from 'zustand/middleware'
import type { UserType } from "@/utils/auth"

type AuthState={
    user:UserType | null
    token:string | null
    isAuthenticated:boolean
    setAuth:(user:UserType,token:string)=>void;
    clearAuth:()=>void
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    storage: createJSONStorage(() => sessionStorage)
    }
  )
);