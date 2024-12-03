import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PasswordGate = ({ children }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordSubmit = () => {
    const correctPassword = 'classroom123'; // Set your desired password here
    if (password === correctPassword) {
      Cookies.set('classroomAccess', 'true', { expires: 1 }); // Set cookie for 1 day
      navigate('/dashboard'); // Navigate to dashboard or any default route
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  // Check if the cookie exists; if yes, bypass password screen
  if (Cookies.get('classroomAccess') === 'true') {
    return <>{children}</>;
  }

  return (
    <div className="password-gate">
      <h2>Enter Classroom Password</h2>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handlePasswordSubmit}>Submit</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default PasswordGate;
