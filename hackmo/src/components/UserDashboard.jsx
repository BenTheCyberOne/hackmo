import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // To handle redirects
import SendComponent from "./SendComponent";

const UserDashboard = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState('');
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
          setUsername(data.username); // Assuming the backend returns the user object with username
          setBalance(data.balance);
        } else {
          return navigate('/login'); // Redirect if unauthorized
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        return navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Grab new user balance
  useEffect(() => {

    // Listen for real-time transaction updates using SSE
    const eventSource = new EventSource('/api/user/stream'); // Backend SSE endpoint
    eventSource.onmessage = (event) => {
      console.log("userStream:",event.data);
      const newBal = JSON.parse(event.data);
      setBalance(newBal.balance)
    };

    return () => {
      eventSource.close(); // Clean up SSE subscription
    };
  }, []);

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
          console.log("OK",data);
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
      console.log("transactionStream:",event.data);
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
    <div className="container dashboard">
      <h1>User Dashboard</h1>
      <p>Welcome, {username}!</p>
      <SendComponent balance={balance} />
      <h2>Latest Transactions</h2>
      <div >
      {transactions && transactions.length > 0 ? (
        transactions.map((tx, index) => (
          <div className="transaction-box" key={index}>
            <h4>From: {tx.sender}</h4>
            <p>To: {tx.receiver}</p>
            <p>Amount: ${tx.amount}</p>
          </div>
        ))
        ) : (
        <p>No transactions available </p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
