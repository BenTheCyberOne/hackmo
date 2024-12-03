import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import Register from './components/Registration';
import Login from './components/Login';
import './styles.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Tracks session status
  const [loading, setLoading] = useState(true); // Tracks whether the app is checking session
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
