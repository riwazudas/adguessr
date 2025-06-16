// src/components/GuessingArea.jsx
import React from 'react';

const GuessingArea = ({ options, onGuess, disabled }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {options.map((option, index) => (
        <button
          key={index}
          className={`
            bg-purple-700 text-white font-bold py-4 px-6 rounded-lg
            hover:bg-purple-800 transition duration-300 ease-in-out
            shadow-lg transform hover:scale-105
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => onGuess(option)}
          disabled={disabled}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default GuessingArea;