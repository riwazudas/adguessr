// src/components/Timer.jsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Using forwardRef to allow parent components to get a ref to this component's internal methods/values
const Timer = forwardRef(({ initialTime, onTimeout, isRunning }, ref) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerId = useRef(null); // To store the interval ID

  // Expose current timeLeft to parent component via ref
  useImperativeHandle(ref, () => ({
    getTimeLeft: () => timeLeft
  }));

  // Reset timeLeft when initialTime changes (new round)
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Clear any existing interval to prevent duplicates
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      timerId.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) { // If time is 1 or less, it's about to hit 0
            clearInterval(timerId.current);
            timerId.current = null;
            onTimeout(); // Call onTimeout when it hits 0
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Stop timer if not running or time has reached 0
      clearInterval(timerId.current);
      timerId.current = null;
    }

    // Cleanup function: Clear interval if component unmounts or isRunning/timeLeft changes
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
    };
  }, [isRunning, timeLeft, onTimeout]); // Dependencies for useEffect

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-white text-5xl font-bold mb-4">
      Time: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
});

export default Timer;