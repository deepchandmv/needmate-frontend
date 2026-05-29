import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyRegistration from './pages/VerifyRegistration';
import Dashboard from './pages/Dashboard';
import BrowseNeeds from './pages/BrowseNeeds';
import PostNeed from './pages/PostNeed';
import Chat from './pages/Chat';
import MyNeeds from './pages/MyNeeds';
import MyTasks from './pages/MyTasks';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-registration" element={<VerifyRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/browse" element={<BrowseNeeds />} />
        <Route path="/post" element={<PostNeed />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/my-needs" element={<MyNeeds />} />
        <Route path="/my-tasks" element={<MyTasks />} />
      </Routes>
    </Router>
  );
}

export default App;
