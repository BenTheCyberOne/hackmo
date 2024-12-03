import React, { useState, useEffect } from "react";

const AnimatedBalance = ({ balance }) => {
  const [displayedBalance, setDisplayedBalance] = useState(balance);

  useEffect(() => {
    if (displayedBalance === balance) return; // If already at the target balance, do nothing

    const increment = balance > displayedBalance ? 1 : -1; // Determine the direction
    const interval = setInterval(() => {
      setDisplayedBalance((prev) => {
        if ((increment > 0 && prev >= balance) || (increment < 0 && prev <= balance)) {
          clearInterval(interval); // Stop the animation when the balance is reached
          return balance; // Set the exact balance
        }
        return prev + increment; // Increment or decrement the displayed balance
      });
    }, 30); // Adjust the interval duration for smoother or faster animations

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [balance, displayedBalance]);

  return (
    <div className="balance-container">
      <h2>Balance: ${displayedBalance}</h2>
    </div>
  );
};

export default AnimatedBalance;
