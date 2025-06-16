// src/components/Timer.jsx
import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime, onTimeout, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(initialTime); // Reset timer when not running
      return;
    }

    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearTimeout(timer); // Cleanup on unmount or re-render
  }, [timeLeft, initialTime, onTimeout, isRunning]);

  useEffect(() => {
    // Reset timer when initialTime changes (e.g., new guessing phase)
    setTimeLeft(initialTime);
  }, [initialTime]);


  return (
    <div className="text-4xl font-extrabold text-white bg-red-600 px-6 py-3 rounded-full shadow-lg">
      Time: {timeLeft}s
    </div>
  );
};

export default Timer;