"use client";
import { Input } from "@/Shadcn/ui/input";
import { useState ,useEffect} from "react";
import Image from "next/image";
import { Label } from "@/Shadcn/ui/label";
import { useRouter } from "next/navigation";
import { Button } from "@/Shadcn/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Shadcn/ui/tabs";
import {userLogin,userRegister,forgotPassword} from "@/utils/auth";
import {toast} from 'react-toastify'
export default function Authentication() {
  const router=useRouter();
  const[email,setEmail]=useState<string>('')
  const[password,setPassword]=useState<string>('')
  const [username,setUsername]=useState<string>('')
  const [isProcessing,setIsProcessing]=useState<boolean>(false);
  const [fullname,setFullname]=useState<string>('');
  const [isLoginValid,setIsLoginValid]=useState<boolean>(false);
  const [isRegisterValid,setIsRegisterValid]=useState<boolean>(false);
  const [emailError,setEmailError]=useState<string>('')

  const validateEmail=(value:string)=>{
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(value);
  }

  useEffect(()=>{
    if(email.length>0 && !validateEmail(email)){
      setEmailError("Please enter a valid email");
    }else{
      setEmailError('')
    }
    setIsLoginValid(email!=='' && password!=='' && validateEmail(email));
    setIsRegisterValid(
      username !== "" && email !== "" && password !== "" && validateEmail(email) && fullname!==""
    );

  },[email,password,username])

  const handleLogin = async() => {
    console.log("Login:", { email, password });
    setIsProcessing(true);
    try {
      const response=await userLogin(email,password);
      console.log("Response is",response);
      toast.success('You have been logged in successfully');
      router.push('/');
    } catch (error) {
      console.log('An error occoured in login',error)
      toast.error("Invalid email or password");
    }
    finally{
      setIsProcessing(false);
    }
  };

  const handleRegister = async() => {
    console.log("Register:", { username, email, password });
    setIsProcessing(true);
    try {
      const response=await userRegister(email,password,username,fullname);
      console.log("Register response is",response);
      toast.success("Your account has been registered. Login to continue");
    } catch (error) {
      console.log("An error occured in registering your account",error);
      toast.error("There was an error in registering your account");
    }finally{
      setIsProcessing(false);
    }
  };
  const handleForgotPassword = async () => {
  if (email === '') {
    toast.error("Please enter your email address");
    return;
  }

  setIsProcessing(true);
  try {
    const response = await forgotPassword(email);
    console.log("Forgot password response is", response?.message);
    toast.success(response?.message ?? "Check your email for instructions");
  } catch (error) {
    console.log("An error occurred", error);
    toast.error("Something went wrong. Try again.");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-[#1c1c1c] to-[#0f0f0f]">
      <div className="w-[90%] h-auto max-w-md p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl text-white">
      <div className="flex flex-row w-full justify-center items-center mb-2">
        <h1 className="text-3xl font-bold items-center text-center mr-2">CollabSphere</h1>
        <Image src='/chat.png' alt='App Logo' width={40} height={40} ></Image>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="w-full flex bg-white/10 backdrop-blur-sm rounded-lg p-1 mb-4">
            <TabsTrigger
              value="login"
              className="w-full data-[state=active]:bg-white data-[state=active]:text-black cursor-pointer rounded-md px-4 py-2 transition duration-300"
            >
              Login
            </TabsTrigger>
             <TabsTrigger value="register" className="w-full data-[state=active]:bg-white cursor-pointer data-[state=active]:text-black rounded-md px-4 py-2 transition duration-300">
              Register
            </TabsTrigger>
          </TabsList>
            <TabsContent value="login">
                <form className="space-y-4" onSubmit={(e)=>e.preventDefault()}>
              <div>
                <Label htmlFor="email" className="mb-1">Email</Label>
                <Input id="login-email" type="email" className="bg-white/10  text-white border-white/20" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              {
                emailError && (
                  <p className="text-xs text-red-500 -mt-2">{emailError}</p>
                )
              }
              <div>
                <Label htmlFor="password" className="mb-1">Password</Label>
                <Input id="login-password" type="password" className="bg-white/10 text-white border-white/20" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
              <button className={`text-red-500 ${isProcessing?' text-gray-300 cursor-not-allowed':
                ''
              } text-xs cursor-pointer hover:underline transition-colors duration-200`}   type="button" onClick={handleForgotPassword} disabled={isProcessing}>
                Forgot Password ?
              </button>
              <Button type="submit" className="w-full mt-2 cursor-pointer" onClick={handleLogin} disabled={!isLoginValid || isProcessing}>Login</Button>
            </form>
            </TabsContent>

             <TabsContent value="register">
            <form className="space-y-4" onSubmit={(e)=>e.preventDefault()}>
              <div>
                <Label htmlFor="username" className="mb-1">Full Name</Label>
                <Input id="fullname" type="text" className="bg-white/10 text-white border-white/20" value={fullname} onChange={(e)=>setFullname(e.target.value)}/>
              </div>
              <div>
                <Label htmlFor="username" className="mb-1">Username</Label>
                <Input id="username" type="text" className="bg-white/10 text-white border-white/20" value={username} onChange={(e)=>setUsername(e.target.value)}/>
              </div>
              <div>
                <Label htmlFor="email" className="mb-1">Email</Label>
                <Input id="email" type="email" className="bg-white/10 text-white border-white/20" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              {emailError && (
                <p className="text-sm text-red-500 -mt-2">{emailError}</p>
              )}
              <div>
                <Label htmlFor="password" className="mb-1">Password</Label>
                <Input id="password" type="password" className="bg-white/10 text-white border-white/20" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
              <Button type="submit" className={`w-full mt-2 ${!isRegisterValid?'cursor-not-allowed':'cursor-pointer'} `} onClick={handleRegister} disabled={!isRegisterValid || isProcessing}>Register</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
