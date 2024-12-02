import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import Register from './components/Registration';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Tracks session status
  const [loading, setLoading] = useState(true); // Tracks whether the app is checking session

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include', // Send cookies with the request
        });

        if (response.ok) {
          setIsAuthenticated(true); // User has a valid session
        } else {
          setIsAuthenticated(false); // No valid session
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false); // Assume no session on error
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking session
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          element={isAuthenticated ? <UserDashboard /> : <Navigate to="/register" />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/register'} />} />
      </Routes>
    </Router>
  );
};

export default App;
