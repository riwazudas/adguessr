// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center p-4">
      <h1 className="text-6xl font-extrabold text-white mb-8 drop-shadow-lg text-center">
        <span className="text-purple-500">Ad</span>Guessr <span className="text-yellow-400">Leaderboard</span>
      </h1>

      <Link to="/" className="mb-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
        Back to Home
      </Link>

      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-2xl p-6">
        {isLoading && <p className="text-white text-center text-xl">Loading leaderboard...</p>}
        {error && <p className="text-red-500 text-center text-xl">{error}</p>}
        {!isLoading && !error && leaderboardData.length === 0 && (
          <p className="text-white text-center text-xl">No scores yet! Be the first to play!</p>
        )}

        {!isLoading && !error && leaderboardData.length > 0 && (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {leaderboardData.map((entry, index) => (
                <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{entry.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{entry.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;