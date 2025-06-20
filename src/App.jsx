// src/App.jsx
import React from 'react';
// REMOVE 'BrowserRouter as Router' from this import, you only need useNavigate, Route, Routes
import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import AddVideoForm from './components/AddVideoForm';

function App() {
  const navigate = useNavigate(); // This is correct here now because main.jsx provides the Router context

  const handleGameEnd = () => {
    console.log("Game ended! Navigating to home.");
    navigate('/');
  };

  return (
    // REMOVE THE <Router> TAGS HERE!
    // The <Routes> component handles path matching within the Router context provided by main.jsx
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game onGameEnd={handleGameEnd} />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/add-video" element={<AddVideoForm />} />
    </Routes>
  );
}

export default App;