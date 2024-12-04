import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styles from './PasswordGate.module.css';

const PasswordGate = ({ children }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordSubmit = () => {
    const correctPassword = 'nonagoninfinity'; // Set your desired password here
    if (password === correctPassword) {
      Cookies.set('classroomAccess', 'true', { expires: 14 }); // Set cookie for 1 day
      navigate('/login'); // Navigate to dashboard or any default route
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  // Check if the cookie exists; if yes, bypass password screen
  if (Cookies.get('classroomAccess') === 'true') {
    return <>{children}</>;
  }

  return (
    <div className={styles.passwordGate} >
      <h2>Enter Classroom Password</h2>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handlePasswordSubmit}>Submit</button>
      {error && <p className={styles.error}>{error}</p>}
      <br />
      <p>NOTICE: THIS WEBAPP IS INTENTIONALLY VULNERABLE. ENTER AT YOUR OWN RISK. AND PLEASE, KEEP IT PG-13/SCHOOL APPROPRIATE </p>
    </div>
  );
};

export default PasswordGate;
