// src/components/AddVideoForm.jsx (or similar for a dedicated page)
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config'; // Ensure this path is correct

const AddVideoForm = () => {
  const [youtubeId, setYoutubeId] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(''); // Comma-separated string
  const [startTime, setStartTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const optionsArray = options.split(',').map(opt => opt.trim());
      const parsedStartTime = parseInt(startTime, 10);

      if (!youtubeId || !answer || optionsArray.length !== 5 || isNaN(parsedStartTime)) {
        setMessage('Error: All fields are required, and options must be 5 comma-separated values, start time must be a number.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'videos'), {
        youtubeId,
        answer,
        options: optionsArray,
        startTime: parsedStartTime,
      });

      setMessage('Video added successfully!');
      // Clear form
      setYoutubeId('');
      setAnswer('');
      setOptions('');
      setStartTime('');

    } catch (error) {
      console.error("Error adding video:", error);
      setMessage(`Error adding video: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-xl text-white mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Add New Video</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="youtubeId" className="block text-sm font-medium text-gray-300">YouTube ID:</label>
          <input
            type="text"
            id="youtubeId"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-300">Correct Answer:</label>
          <input
            type="text"
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="options" className="block text-sm font-medium text-gray-300">Options (5, comma-separated):</label>
          <input
            type="text"
            id="options"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2"
            placeholder="Option1, Option2, Option3, Option4, Option5"
            required
          />
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">Start Time (seconds):</label>
          <input
            type="number"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Video'}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default AddVideoForm;