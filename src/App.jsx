// src/App.jsx (Example temporary integration)
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import AddVideoForm from './components/AddVideoForm'; // <--- Import it

function App() {
  const handleGameEnd = () => {
    // Optionally navigate to leaderboard or home
    // For simplicity, let's just log for now
    console.log("Game ended!");
    // You might want to use useNavigate hook here if this was a functional component
    // history.push('/leaderboard'); // Example if you used useHistory
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game onGameEnd={handleGameEnd} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/add-video" element={<AddVideoForm />} /> {/* <--- New Route for your form */}
      </Routes>
    </Router>
  );
}

export default App;