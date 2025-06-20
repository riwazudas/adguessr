// src/pages/Game.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import VideoPlayer from '../components/VideoPlayer';
import GuessingArea from '../components/GuessingArea';
import Timer from '../components/Timer';
import ScoreDisplay from '../components/ScoreDisplay';
import Swal from 'sweetalert2';

const MAX_ROUNDS_CEILING = 10; // This is now the maximum possible, but game plays for available videos
const BASE_POINTS_CORRECT = 500;
const POINTS_PER_SECOND_LEFT = 10;
const MAX_GUESS_TIME_PER_ROUND = 45;

const Game = ({ onGameEnd }) => {
  const [videos, setVideos] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInitialValue, setTimerInitialValue] = useState(MAX_GUESS_TIME_PER_ROUND);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef(null);

  const shuffleArray = useCallback((array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, []);

  const startNewRound = useCallback(() => {
    // Only attempt to start a new round if there are videos available for the current round
    // The main useEffect will handle ending the game if currentRound > videos.length
    const videoIndex = currentRound - 1;
    if (videoIndex < videos.length) {
      setCurrentVideo(videos[videoIndex]);
      setIsTimerRunning(true);
      setTimerInitialValue(MAX_GUESS_TIME_PER_ROUND);
      console.log(`Game: Starting Round ${currentRound}. Video ID: ${videos[videoIndex].youtubeId}`);
      console.log(`Game: isTimerRunning set to TRUE.`);
      console.log(`Game: Timer initial value set to ${MAX_GUESS_TIME_PER_ROUND}.`);
    } else {
        // This case should now be caught by the useEffect that calls endGame
        // if (currentRound > videos.length)
        console.log(`Game: No more videos for round ${currentRound}. Preparing to end game.`);
    }
  }, [videos, currentRound]);


  const endGame = useCallback(async () => {
    setGameEnded(true);
    setIsTimerRunning(false);

    Swal.fire({
      title: 'Game Over!',
      html: `Your final score: <span class="text-yellow-400 text-4xl font-bold">${score}</span>`,
      icon: 'success',
      confirmButtonText: 'Submit Score',
      showCancelButton: true,
      cancelButtonText: 'Play Again',
      input: 'text',
      inputLabel: 'Enter your name for the leaderboard:',
      inputPlaceholder: 'Anonymous',
      validationMessage: 'Please enter a name!',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'You need to write something!';
        }
      },
      customClass: {
        popup: 'bg-gray-800 text-white rounded-lg shadow-2xl !flex !flex-col !h-auto px-4 py-6',
        confirmButton: 'flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded !m-0',
        cancelButton: 'flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded !m-0',

        // --- SIMPLIFIED THESE CLASSES ---
        content: '!flex !flex-col !items-center !justify-center !w-full', // Removed !px-4 !py-4 here
        inputLabel: 'text-gray-300 block text-center mt-4 mb-2',
        input: 'bg-gray-700 border border-gray-600 text-white rounded-md w-full mx-auto', // Removed !px-4 !py-2 here
        // --- END SIMPLIFIED CLASSES ---

        container: 'swal2-container',
        title: 'text-white text-center',
        htmlContainer: 'text-center mb-4',
        actions: 'flex flex-col sm:flex-row justify-center mt-6 w-full px-4 gap-4',
      },
      backdrop: `
        rgba(0,0,123,0.4)
        url("/nyan-cat.gif")
        left top
        no-repeat
      `
    }).then(async (result) => {
      if (result.isConfirmed) {
        const playerName = result.value || 'Anonymous';
        try {
          await addDoc(collection(db, 'leaderboard'), {
            name: playerName,
            score: score,
            timestamp: new Date(),
          });
          Swal.fire({
            title: 'Score Submitted!',
            text: 'Check the leaderboard!',
            icon: 'success',
            customClass: {
              popup: 'bg-gray-800 text-white rounded-lg shadow-2xl',
              confirmButton: 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded',
            }
          }).then(() => {
            onGameEnd();
          });
        } catch (error) {
          console.error("Error submitting score:", error);
          Swal.fire('Error', 'Failed to submit score.', 'error');
          onGameEnd();
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        onGameEnd();
      }
    });
  }, [score, onGameEnd]);


  const handleRoundEndDueToTime = useCallback(() => {
    if (gameEnded || !currentVideo) return;

    setIsTimerRunning(false);

    Swal.fire({
      title: 'Time Up!',
      html: `The correct answer was: <span class="font-bold text-green-400">${currentVideo.answer}</span>`,
      icon: 'info',
      confirmButtonText: 'Next Round',
      customClass: {
        popup: 'bg-gray-800 text-white rounded-lg shadow-2xl',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
      }
    }).then(() => {
      setCurrentRound((prevRound) => prevRound + 1);
    });
  }, [currentVideo, gameEnded]);


  const handleGuess = useCallback((guess) => {
    if (gameEnded || !currentVideo) return;

    setIsTimerRunning(false);

    const timeLeft = timerRef.current ? timerRef.current.getTimeLeft() : 0;
    console.log(`Guess made: "${guess}". Time Left: ${timeLeft}s`);

    if (guess === currentVideo.answer) {
      const timeBonus = Math.max(0, timeLeft);
      const points = BASE_POINTS_CORRECT + timeBonus * POINTS_PER_SECOND_LEFT;

      setScore((prevScore) => prevScore + points);
      Swal.fire({
        title: 'Correct!',
        html: `You earned <span class="text-yellow-400 font-bold">${points}</span> points!`,
        icon: 'success',
        confirmButtonText: 'Next Round',
        customClass: {
          popup: 'bg-gray-800 text-white rounded-lg shadow-2xl',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded',
        }
      }).then(() => {
        setCurrentRound((prevRound) => prevRound + 1);
      });
    } else {
      Swal.fire({
        title: 'Incorrect!',
        html: `The answer was: <span class="font-bold text-green-400">${currentVideo.answer}</span>`,
        icon: 'error',
        confirmButtonText: 'Next Round',
        customClass: {
          popup: 'bg-gray-800 text-white rounded-lg shadow-2xl',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded',
        }
      }).then(() => {
        setCurrentRound((prevRound) => prevRound + 1);
      });
    }
  }, [currentVideo, gameEnded, BASE_POINTS_CORRECT, POINTS_PER_SECOND_LEFT]);


  // --- Effects ---

  // Fetch videos from Firestore on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const videoCollection = collection(db, 'videos');
        const videoSnapshot = await getDocs(videoCollection);
        const videoList = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const validVideos = videoList.filter(video =>
          video.youtubeId &&
          video.answer &&
          Array.isArray(video.options) && video.options.length === 5 &&
          video.options.includes(video.answer) &&
          typeof video.startTime === 'number'
        );

        console.log("Fetched and filtered videos:", validVideos.length, "valid videos found.");

        if (validVideos.length === 0) {
          Swal.fire({
            title: 'No Videos Found!',
            text: 'There are no valid videos in your Firestore database. Please add some to play the game.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          // Set gameEnded to true to prevent game from trying to start with no videos
          setGameEnded(true);
        } else if (validVideos.length < MAX_ROUNDS_CEILING) {
          Swal.fire({
            title: 'Fewer Videos Than Max Rounds!',
            text: `You have ${validVideos.length} valid videos. The game will play for ${validVideos.length} rounds instead of the maximum ${MAX_ROUNDS_CEILING}.`,
            icon: 'info',
            confirmButtonText: 'Got It!'
          });
        }
        setVideos(shuffleArray(validVideos));
      } catch (error) {
        console.error("Error fetching videos:", error);
        Swal.fire('Error', 'Failed to load videos. Please check your internet connection or Firebase setup.', 'error');
        setGameEnded(true); // End game on fetch error as well
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [shuffleArray]);

  // Effect to manage game flow (start new round or end game)
  useEffect(() => {
    if (isLoading || gameEnded) return;

    // The game will run for 'videos.length' rounds.
    // If currentRound exceeds the number of available videos, end the game.
    if (videos.length > 0 && currentRound <= videos.length) {
      startNewRound();
    } else if (currentRound > videos.length && videos.length > 0) { // Ensure videos were actually loaded
      endGame();
    } else if (videos.length === 0 && !isLoading) {
      // If no videos were loaded at all (and not loading), ensure game ends.
      // This is mostly a fallback if the fetchVideos didn't set gameEnded for some reason.
      endGame();
    }
  }, [videos, currentRound, isLoading, gameEnded, startNewRound, endGame]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <p className="text-white text-3xl animate-pulse">Loading AdGuessr...</p>
      </div>
    );
  }

  const videoPlayerStartTime = currentVideo?.startTime || 0;
  const videoPlayerEndTime = videoPlayerStartTime + MAX_GUESS_TIME_PER_ROUND;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-extrabold text-white mb-8 drop-shadow-lg text-center">
        <span className="text-purple-500">Ad</span>Venture <span className="text-yellow-400">Guess</span>
      </h1>

      <ScoreDisplay score={score} round={currentRound} />

      <div className="mt-8 w-full max-w-4xl">
        {currentVideo && (
          <VideoPlayer
            youtubeId={currentVideo.youtubeId}
            startTime={videoPlayerStartTime}
            endTime={videoPlayerEndTime}
            onEnded={handleRoundEndDueToTime}
            isPlaying={!gameEnded}
            key={`round-${currentRound}-${currentVideo.youtubeId}`}
          />
        )}
      </div>

      <div className="mt-8 flex flex-col items-center w-full max-w-4xl">
        {!gameEnded && (
          <Timer
            ref={timerRef}
            initialTime={timerInitialValue}
            onTimeout={handleRoundEndDueToTime}
            isRunning={isTimerRunning}
          />
        )}

        {currentVideo && !gameEnded && (
          <GuessingArea
            options={shuffleArray([...currentVideo.options])}
            onGuess={handleGuess}
            disabled={gameEnded || !isTimerRunning}
          />
        )}
      </div>
    </div>
  );
};

export default Game;