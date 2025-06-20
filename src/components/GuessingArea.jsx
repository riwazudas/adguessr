// src/components/GuessingArea.jsx
import React, { useCallback } from 'react';

const GuessingArea = ({ options, onGuess, disabled }) => {
  const handleClick = useCallback((option) => {
    if (!disabled) {
      onGuess(option); // Just pass the selected option, Game.jsx will get the time
    }
  }, [onGuess, disabled]);

  return (
    <div className="w-full max-w-lg grid grid-cols-2 gap-4 mt-6">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleClick(option)}
          disabled={disabled}
          className={`
            bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg
            transform transition duration-300 ease-in-out
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          `}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default GuessingArea;