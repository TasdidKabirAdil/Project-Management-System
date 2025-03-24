import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useLocation, Navigate, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Login from '../src/components/Login'
import Member from '../src/components/Member'
import Admin from '../src/components/Admin'


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const showNavbar = location.pathname !== '/login'
  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('id')

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.clear()
    navigate('/login')
  }

  return (
    <>
      {showNavbar && userId && (
         <nav className="navbar">
         <div className="navbar-content">
           <Link to="#" className="navbar-brand" style={{color: 'rgb(146, 162, 186)'}}>Project Management System</Link>
           <div className="navbar-links">
             {role === 'Member' ? (
               <Link to='/member' className="navbar-link">Member</Link>
             ) : (
               <>
                 <Link to='/admin' className="navbar-link">Admin</Link>
                 <Link to='/member' className="navbar-link">Member</Link>
               </>
             )}
           </div>
           <button className="logout-button" onClick={handleLogout}>logout</button>
         </div>
       </nav>
      )}

      <Routes>
        <Route index element={<Login />} />
        <Route path='login' element={<Login />} />
        <Route path='member' element={
          userId ? <Member /> : <Navigate to='/login' state={{ from: location, message: 'You must login to access Member page' }} replace />
        } />
        <Route path='admin' element={
          userId && role === 'Admin' ? <Admin /> : <Navigate to='/login' state={{ from: location, message: 'You must be an admin to access page' }} replace />
        } />
      </Routes>
    </>
  )
}

export default App
