import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import IssueList from './components/IssueList';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

export default function App() {
  return (
    <Router>
      <NavBar />
      <div className="container py-4" style={{ marginTop: '60px' }}>
        <Routes>
          <Route path="/" element={<IssueList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}


