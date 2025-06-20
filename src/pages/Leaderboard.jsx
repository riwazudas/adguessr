// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is installed

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const leaderboardCollection = collection(db, 'leaderboard');
        // Ensure you've created this composite index in Firebase Console:
        // Collection: leaderboard, Fields: score (desc), timestamp (asc)
        const q = query(leaderboardCollection, orderBy('score', 'desc'), orderBy('timestamp', 'asc'), limit(10));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaderboardData(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    // Main container: min-height, background, flex column for vertical stacking, center items horizontally, add responsive padding
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center p-4 sm:p-6 md:p-8">
      {/* Game Title: Responsive font size, margin-bottom for spacing */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg text-center">
        {/* Assuming you want AdGuessr like the game title */}
        <span className="text-purple-500">Ad</span><span className="text-yellow-400">guessr</span> Leaderboard
      </h1>

      {/* Back to Home Button: Consistent spacing */}
      <Link to="/" className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
        Back to Home
      </Link>

      {/* Leaderboard Table Container */}
      {/* Adjusted max-width to allow more flexibility, added overflow-x-auto for small screens */}
      <div className="w-full max-w-xl bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6">
        {isLoading && <p className="text-white text-center text-xl">Loading leaderboard...</p>}
        {error && <p className="text-red-500 text-center text-xl">{error}</p>}
        {!isLoading && !error && leaderboardData.length === 0 && (
          <p className="text-white text-center text-xl">No scores yet! Be the first to play!</p>
        )}

        {!isLoading && !error && leaderboardData.length > 0 && (
          // Added a responsive div around the table for horizontal scrolling on small screens
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {leaderboardData.map((entry, index) => (
                  <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}`}>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-yellow-400">{index + 1}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-white">{entry.name}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-white">{entry.score}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-400">
                      {/* Safely convert Firestore Timestamp to Date object */}
                      {entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;