import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import Register from './components/Registration';
import Login from './components/Login';
import Admin from './components/Admin';
import TemplateManager from './components/TemplateManager';
import PasswordGate from './components/PasswordGate';
import './styles.css';

const App = () => {
  return (
    <Router>
    <PasswordGate>
      <Routes>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/templates/manager" element={<TemplateManager />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      </PasswordGate>
    </Router>
  );
};

export default App;
