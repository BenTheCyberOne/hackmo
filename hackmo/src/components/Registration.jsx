import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  //naughty words
  const prohibitedWords = ['nigger', 'nigga', 'faggot', 'cock', 'cunt', 'retard', 'fuck', 'shit', 'ass', 'pussy'];
  // Regular expression for MongoDB-safe characters
  const mongoSafeRegex = /^[a-zA-Z0-9_.-]+$/;

  const isUsernameValid = (username) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long.';
    }
    if (!mongoSafeRegex.test(username)) {
      return 'Username contains invalid characters. Only letters, numbers, _, -, and . are allowed.';
    }
    for (let word of prohibitedWords) {
      if (username.toLowerCase().includes(word)) {
        return 'Username contains inappropriate language.';
      }
    }
    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const usernameError = isUsernameValid(username);
    if (usernameError) {
      setErrorMessage(usernameError);
      return;
    }
    // Check if the passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    try {
      const response = await fetch('/register', {
        method: 'POST',
        credentials: 'include', // required???
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // If registration is successful, redirect to the login page or dashboard
        return navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Registration failed.');
      }
    } catch (error) {
      setErrorMessage('An error occurred during registration.');
    }
  };

  return (
    <div className="login-wrapper">
    <Banner />
      <h2 className="header">Login</h2>
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
        </div>
         <div className="form-group">
          <label htmlFor="confirmPassword" className="label">
          Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default Register;
