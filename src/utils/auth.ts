import axios from 'axios'


const SERVER=process.env.NEXT_PUBLIC_URL
console.log("Server url is",SERVER);

export type UserType={
  id: string;
  email: string;
  username: string;
  full_name: string;
  profile_image: string;
  status_message: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

type LoginDetails={
    access_token:string,
    user:UserType,
}

type RegisterResponse={
    message:string,
    user_id:string,
    email_sent:boolean
}
type ForgotPasswordResponse = {
    message:string

}
const userLogin=async(email:string,password:string):Promise<LoginDetails | null>=>{
    try {
        const response = await axios.post(`${SERVER}/auth/login`,{
            email:email,
            password:password,
        })
        return response.data;
        
    } catch (error) {
        console.log("An error occured",error);
        return null;
        
    }

}

const userRegister=async(email:string,password:string,username:string,full_name:string):Promise<RegisterResponse | null >=>{
    try {
        const response= await axios.post(`${SERVER}/auth/register`,{
            email:email,
            password:password,
            username:username,
            full_name:full_name
        })
        return response.data;
        
    } catch (error) {
        console.log("An error occoured in registeration",error)
        return null;
    }
}
const forgotPassword = async(email:string):Promise<ForgotPasswordResponse | null>=>{
    try {
        const response= await axios.post(`${SERVER}/auth/forgot-password`,{
            email:email
        })
        return response.data;
        
    } catch (error) {
        console.log("An error occoured in forgot password endpoint",error)
        return null;;
        
    }

}

export {userLogin,userRegister,forgotPassword};