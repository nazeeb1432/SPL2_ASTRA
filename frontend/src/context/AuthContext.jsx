import React,{createContext,useState,useContext} from "react";
import {useNavigate} from "react-router-dom";

const AuthContext = createContext();

const useAuthContext=()=>{
    return useContext(AuthContext);//to access values
}

const AuthContextProvider=({children})=>{
    const[isLoggedin,setIsLoggedin]=useState(false);
    const[token,setToken]=useState('');
    const [name,setName]=useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');

    const login=()=>{
        setIsLoggedin(true);
    }

    const logout = () => {
        
        setIsLoggedin(false);
        setToken('');
        setEmail('');
        setPassword('');
        setName('');
    };

    const nameHandle=(givenName)=>{
        setName(givenName);
    }

    const tokenize=(givenToken)=>{
        console.log(givenToken);
        setToken(givenToken);
    }

    const emailHandle=(givenEmail)=>{
        setEmail(givenEmail);
    }

    const passHandle=(givenPass)=>{
        setPassword(givenPass);
    }

    return (
        <AuthContext.Provider value={{isLoggedin,login,logout,token,tokenize,email,emailHandle,password,passHandle,name,nameHandle}}>
            {children}
        </AuthContext.Provider>
    )

}

export {AuthContextProvider,useAuthContext}