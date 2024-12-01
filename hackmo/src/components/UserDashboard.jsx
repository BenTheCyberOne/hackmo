import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // To handle redirects

const UserDashboard = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  // Fetch the logged-in user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include', // Make sure to include cookies for session validation
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.username); // Assuming the backend returns the user object with username
        } else {
          // If the response is not okay, redirect to the register page
          history.push('/register');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        history.push('/register'); // If there's an error, redirect to the register page
      } finally {
        setLoading(false); // Hide the loading spinner once the API call is done
      }
    };

    fetchUser();
  }, [history]);

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator while fetching user data
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, {username}!</p>
    </div>
  );
};

export default UserDashboard;
