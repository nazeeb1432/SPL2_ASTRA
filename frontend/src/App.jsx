import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Library from './pages/Library';
import Base from './pages/Base';
import DocumentReader from './pages/DocumentReader';

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
        <Route path="/base" element={<Base/>}/>
        <Route path="/document/:documentId" element={<DocumentReader />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
