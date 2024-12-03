import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // To handle redirects

const UserDashboard = () => {
  const [username, setUsername] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch the logged-in user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include', // Include cookies for session validation
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.username); // Assuming the backend returns the user object with username
        } else {
          navigate('/register'); // Redirect if unauthorized
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/register');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch transactions initially and subscribe to updates
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {

          const data = await response.json();
          console.log("OK",data.transactions);
          setTransactions(data.transactions); // Assume `transactions` array is returned
        } else {
          console.error('Failed to fetch transactions.');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();

    // Listen for real-time transaction updates using SSE
    const eventSource = new EventSource('/api/transactions/stream'); // Backend SSE endpoint
    eventSource.onmessage = (event) => {
      const newTransaction = JSON.parse(event.data);
      setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]); // Prepend new transaction
    };

    return () => {
      eventSource.close(); // Clean up SSE subscription
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, {username}!</p>
      <h2>Latest Transactions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {transactions.map((transactionN, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '10px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <p><strong>Sender:</strong> {transactionN.sender}</p>
            <p><strong>Receiver:</strong> {transactionN.receiver}</p>
            <p><strong>Amount:</strong> {transactionN.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
