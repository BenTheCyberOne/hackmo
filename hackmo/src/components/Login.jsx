import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    setErrorMessage(''); // Clear previous error messages

    try {
      const response = await fetch('/login', {
        method: 'POST',
        credentials: 'include', // Send cookies with the request
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // If login is successful, redirect to the dashboard
        return navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Invalid username or password.');
      }
    } catch (error) {
      setErrorMessage('An error occurred during login.');
      console.error('Login Error:', error);
    }
  };

  return (
    <div className="container login-container">
      <h2 className="title">Login</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form className="form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="button-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
