// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';

// A wrapper component to access useNavigate inside Router context
const GameWrapper = () => {
  const navigate = useNavigate();
  const handleGameEnd = () => {
    navigate('/leaderboard'); // Navigate to leaderboard after game ends
  };
  return <Game onGameEnd={handleGameEnd} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GameWrapper />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;