import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Library from './pages/Library';

function App() {
  

  return (
    <>
    <Router>
      <Routes>
        {/* Define routes for different pages */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/library" element={<Library/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App
