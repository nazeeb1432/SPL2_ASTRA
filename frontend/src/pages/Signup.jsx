import { useState } from 'react'
import React from 'react'
import { Link, Router, useSearchParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import api from '../utils/api'
import Cookies from 'js-cookie'

const Signup = () => {

    const {tokenize,nameHandle,emailHandle,login}=useAuthContext();
    const navigate=useNavigate();
    

    const[inputs,setInputs] = useState({
        name:'',
        email:'',
        password:'',
        confirmPassword:''
    });

    const handleSubmit = async(e)=>{
        e.preventDefault()
        // console.log(inputs)
        if (inputs.password !== inputs.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try{
            const response= await api.post('/signup',{
                name:inputs.name,
                email:inputs.email,
                password:inputs.password
            });

           

            nameHandle(inputs.name);
            emailHandle(inputs.email);

            // Assuming the backend will set cookies, not return the token in the body
            const token = Cookies.get("token");  // Get the token from cookies

            if(token) tokenize(token);
            else console.error("Token not found in cookies");


            login();//to set the isLoggedin state to true
            navigate('/base');

        }catch (error) {
            if (error.response?.status === 400) {
              alert("User already exists. Redirecting to login.");
              navigate("/login");
            } else {
              console.error("Signup Error:", error);
            }

        }
    }

  return (
    <>
        <section className="bg-gray-50 dark:bg-gray-900">
       <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/>
          ASTRA Signup   
      </a>
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Create an account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                  <div>
                      <label htmlFor="Name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Name</label>
                      <input type="text" name="Name" id="Name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      placeholder="John Doe" required="" value={inputs.name} onChange={(e)=> setInputs({...inputs,name:e.target.value})}/>
                  </div>
                  <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                      <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="name@company.com" required="" value={inputs.email} onChange={(e)=> setInputs({...inputs,email:e.target.value})}/>
                  </div>
                  <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      required="" value={inputs.password} onChange={(e)=> setInputs({...inputs,password:e.target.value})}/>
                  </div>
                  <div>
                      <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                      <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      required="" value={inputs.confirmPassword} onChange={(e)=> setInputs({...inputs,confirmPassword:e.target.value})}/>
                  </div>
                  <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">I accept the <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
                      </div>
                  </div>
                  <div className='flex justify-center'>
                  <button type="submit" className="text-white text-lg bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg  px-10 py-2.5 text-center me-2 mb-2">Sign Up</button>
                  </div>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                      Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</Link>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
    </>
  )
}

export default Signup