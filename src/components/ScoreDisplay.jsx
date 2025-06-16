// src/components/ScoreDisplay.jsx
import React from 'react';

const ScoreDisplay = ({ score, round }) => {
  return (
    <div className="text-center text-white mt-4 space-y-2">
      <p className="text-3xl font-extrabold">Score: <span className="text-yellow-400">{score}</span></p>
      <p className="text-2xl font-semibold">Round: <span className="text-green-400">{round}/10</span></p>
    </div>
  );
};

export default ScoreDisplay;