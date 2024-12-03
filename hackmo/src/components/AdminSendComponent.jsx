import React, { useState } from "react";

const AdminSendComponent = () => {
  const [senderID, setSenderID] = useState("");
  const [receiverID, setReceiverID] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page

    try {
      const response = await fetch("/admin/send", {
        method: "POST",
        credentials: "include", // Include cookies to authenticate session
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senderID, receiverID, amount: parseFloat(amount)}),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Transaction Successful: ${data.transaction.sender} sent $${data.transaction.amount} to ${data.transaction.receiver}`);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (err) {
      setMessage("Error: Something went wrong. Please try again.");
      console.error("Transaction error:", err);
    }
  };

  return (
    <div className="container">
      <h2>Send Money as Admin</h2>
      <form onSubmit={handleSend}>
        <div>
          <label htmlFor="senderID">Sender ID:</label>
          <input
            type="text"
            id="senderID"
            value={SenderID}
            onChange={(e) => setSenderID(e.target.value)}
            required
            className="mb-2"
          />
        </div>
        <div>
          <label htmlFor="receiverID">Receiver ID:</label>
          <input
            type="text"
            id="receiverID"
            value={receiverID}
            onChange={(e) => setReceiverID(e.target.value)}
            required
            className="mb-2"
          />
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mb-2"
            min="0"
          />
        </div>
        <button type="submit" className="button-primary">Send</button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default AdminSendComponent;
