// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-12">
        {/* AdGuessr Guess Logo/Text */}
        <h1 className="text-7xl font-extrabold text-white drop-shadow-lg leading-tight">
          <span className="text-purple-500">Ad</span>Guessr
        </h1>
        <p className="mt-4 text-2xl text-gray-300 font-semibold">
          Can you guess the ad from a snippet?
        </p>
        <div className="mt-8 flex gap-6">
          <Link
            to="/game"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-xl"
          >
            Start Game
          </Link>
          <Link
            to="/leaderboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-xl"
          >
            Leaderboard
          </Link>
        </div>
      </div>

      {/* Optional: Add a small logo at the bottom */}
      <footer className="absolute bottom-4 text-gray-500 text-sm">
        <p>&copy; 2025 AdGuessr Guess. All rights reserved.</p>
        {/* Placeholder for a custom logo image */}
        <img src="logo-big.png" alt="AdGuessr Guess Logo" className="h-8 mx-auto mt-2" />
      </footer>
    </div>
  );
};

export default Home;