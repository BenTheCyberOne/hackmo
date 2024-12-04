import React, { useEffect, useState } from "react";

const WealthiestUser = () => {
  const [wealthiest, setWealthiest] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWealthiestUser = async () => {
      try {
        const response = await fetch("/api/wealthy", {
          credentials: "include", // Include cookies for session
        });
        if (response.ok) {
          const data = await response.json();
          setWealthiest(data.user);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch data.");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      }
    };

    // Initial fetch
    fetchWealthiestUser();

    // Poll every 8 seconds
    const interval = setInterval(fetchWealthiestUser, 8000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wealthiest-user">
      {error ? (
        <p className="error-message">{error}</p>
      ) : wealthiest ? (
        <div>
        <h3>Wealthiest User</h3>
        <p>
          <strong>Username:</strong> {wealthiest.username}
        </p>
        <p>
          <strong>Balance:</strong> ${wealthiest.balance.toFixed(2)}
        </p>
      </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default WealthiestUser;
