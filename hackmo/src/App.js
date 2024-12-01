import logo from './logo.svg';
import './App.css';
import UserDashboard from './components/UserDashboard';
import Register from './components/Registration'; // Assuming you have a Register component
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
