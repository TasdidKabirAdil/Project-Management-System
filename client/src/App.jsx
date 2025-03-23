import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useLocation } from "react-router-dom";
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
  // const showNavbar = location.pathname !== '/login'

  return (
    <>
      {/* {showNavbar && (
        <Navbar bg="primary" variant="dark" expand="lg">
          <Nav>
            <Nav.Link as={Link} to='/member'>Member</Nav.Link>
          </Nav>
        </Navbar>
      )} */}

      <Routes>
        <Route index element={<Login />} />
        <Route path='login' element={<Login />} />
        <Route path='member' element={<Member />} />
        <Route path='admin' element={<Admin />} />
      </Routes>
    </>
  )
}

export default App
