import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion
import SendComponent from "./SendComponent";
import AnimatedBalance from "./AnimatedBalance";

const UserDashboard = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <h1>User Dashboard</h1>
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
                <br />
                <p>To: {tx.receiver}</p>
                <br />
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
