import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion
import SendComponent from "./SendComponent";
import AnimatedBalance from "./AnimatedBalance";
import WealthiestUser from "./WealthiestUser";
import Banner from './Banner';

const UserDashboard = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Make a POST request to the /logout route
      const response = await fetch('/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials (cookies, session data, etc.)
      });

      if (response.ok) {

        // Redirect the user to the login page
        navigate('/login');
      } else {
        console.error('Logout failed');
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setBalance(data.balance);
        } else {
          return navigate('/login');
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

  useEffect(() => {
    const eventSource = new EventSource('/api/stream/user');
    eventSource.onopen = () => {
      console.log("SSE connection established");
    };
    eventSource.onmessage = (event) => {
      console.log("userStream:", event.data);

      if (event.data !== "keep-alive") {
        try {
          const newBal = JSON.parse(event.data);
          setBalance(newBal.balance);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log("OK", data);
          setTransactions(data.transactions);
        } else {
          console.error('Failed to fetch transactions.');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();

    const eventSource = new EventSource('/api/stream/transactions');
    eventSource.onmessage = (event) => {
      console.log("_transactionStream:", event.data);
      if (event.data !== "keep-alive") {
        const newTransaction = JSON.parse(event.data);
        console.log("transactionStream_:", event.data);
        setTransactions((prevTransactions) => {
          const updatedTransactions = [newTransaction.transactions, ...prevTransactions];
          console.log("transactionsfromStream", updatedTransactions);
          return updatedTransactions;
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container dashboard">
    <Banner />
      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <h1>User Dashboard</h1>
      <WealthiestUser />
      <p>Welcome, {username}!</p>
      <AnimatedBalance balance={balance} />
      <SendComponent balance={balance} />
      <h2>Latest Transactions</h2>
      <div>
        {transactions && transactions.length > 0 ? (
          <AnimatePresence>
            {transactions.map((tx, index) => (

              <motion.div
                className="transaction-box"
                key={tx.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                
                <h4>From: {tx.sender}</h4>
                
                <strong>To: {tx.receiver}</strong>
                
                <p>Amount: ${tx.amount}</p>
                
                <p>Time: {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "Unknown"}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p>No transactions available</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
