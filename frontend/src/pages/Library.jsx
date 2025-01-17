import React from 'react'
import { useAuthContext } from '../context/AuthContext'
import LogoutButton from '../components/LogoutButton';

const Library = () => {

  const {email} = useAuthContext();
  return (
    <>
     <div>Library</div>
      <div>{email}</div><br/>
      <LogoutButton />
    </>
  )
}

export default Library