import React,{createContext,useState,useContext,useEffect} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";

const AuthContext = createContext();

const useAuthContext=()=>{
    return useContext(AuthContext); 
}

const AuthContextProvider=({children})=>{
    const[isLoggedin,setIsLoggedin]=useState(false);
    const[token,setToken]=useState('');
    const [name,setName]=useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');

    
    // Initialize state from cookies when the app loads
    useEffect(() => {
        const tokenFromCookie = Cookies.get("token");
        const emailFromCookie = Cookies.get("email");

        if (tokenFromCookie && emailFromCookie) {
            setToken(tokenFromCookie);
            setEmail(emailFromCookie);
            setIsLoggedin(true);
        }
    }, []);
    
    const login=()=>{
        setIsLoggedin(true);
    }

    const logout = () => {
        
        setIsLoggedin(false);
        setToken('');
        setEmail('');
        setPassword('');
        setName('');

        // Clear cookies on logout
        Cookies.remove("token");
        Cookies.remove("email");
    };

    const nameHandle=(givenName)=>{
        setName(givenName);
    }

    const tokenize=(givenToken)=>{
        console.log(givenToken);
        setToken(givenToken);
        Cookies.set("token", givenToken, { secure: true, sameSite: "lax" }); // Set cookie
    }

    const emailHandle=(givenEmail)=>{
        setEmail(givenEmail);
        Cookies.set("email", givenEmail, { secure: true, sameSite: "lax" }); // Set cookie
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