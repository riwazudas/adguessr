// src/pages/Game.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase-config';
import VideoPlayer from '../components/VideoPlayer';
import GuessingArea from '../components/GuessingArea';
import Timer from '../components/Timer';
import ScoreDisplay from '../components/ScoreDisplay';
import Swal from 'sweetalert2';

const MAX_ROUNDS = 10;
const INITIAL_VIDEO_DURATION = 15; // First snippet duration
const HINT_VIDEO_DURATION = 10; // Additional snippet duration
const GUESSING_TIME_INITIAL = 15; // Time for first guess
const GUESSING_TIME_HINT = 10; // Time for subsequent guesses

const Game = ({ onGameEnd }) => {
  const [videos, setVideos] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoStage, setVideoStage] = useState(0); // 0: initial (15s), 1: first hint (25s total), 2: second hint (35s total)
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [isGuessingPhase, setIsGuessingPhase] = useState(false); // To control timer and guess area visibility
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInitialValue, setTimerInitialValue] = useState(GUESSING_TIME_INITIAL);
  const [isLoading, setIsLoading] = useState(true);

  // Function to shuffle an array (Fisher-Yates) for random video order
  const shuffleArray = useCallback((array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, []);

  // --- Callback functions (startNewRound, endGame, handleGuess, handleTimerTimeout, handleVideoSnippetEnded) ---
  // Define these before the useEffect that calls them
  const startNewRound = useCallback(() => {
    if (videos.length === 0 || currentRound > MAX_ROUNDS) {
      return;
    }
    const videoIndex = currentRound - 1;
    if (videoIndex < videos.length) {
      setCurrentVideo(videos[videoIndex]);
      setVideoStage(0); // Reset video stage for new round
      setIsGuessingPhase(false); // Video plays first
      setIsTimerRunning(false); // Timer is not running initially
      setTimerInitialValue(GUESSING_TIME_INITIAL); // Reset timer value for the first guess phase
    }
  }, [videos, currentRound, MAX_ROUNDS]);


  const endGame = useCallback(async () => {
    setGameEnded(true);
    setIsTimerRunning(false);
    setIsGuessingPhase(false);

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
        popup: 'bg-gray-800 text-white rounded-lg shadow-2xl',
        confirmButton: 'bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded',
        cancelButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2',
        input: 'bg-gray-700 border border-gray-600 text-white rounded-md p-2 w-full',
        inputLabel: 'text-gray-300'
      },
      // This Nyan Cat gif won't work unless you put it in the public folder!
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


  const handleVideoSnippetEnded = useCallback(() => {
    if (gameEnded || !currentVideo) return;

    setIsGuessingPhase(true); // Start guessing phase
    setIsTimerRunning(true); // Start timer

    if (videoStage === 0) {
      setTimerInitialValue(GUESSING_TIME_INITIAL);
    } else {
      setTimerInitialValue(GUESSING_TIME_HINT);
    }
  }, [currentVideo, gameEnded, videoStage]);


  const handleGuess = useCallback((guess) => {
    if (gameEnded || !currentVideo || !isGuessingPhase) return;

    setIsTimerRunning(false); // Stop timer immediately on guess
    setIsGuessingPhase(false); // Disable guessing area

    if (guess === currentVideo.answer) {
      let points = 0;
      const timeBonus = timerInitialValue; // Simple bonus: uses initial time for the stage

      if (videoStage === 0) { // Guessed after 15s video
        points = 200 + timeBonus;
      } else if (videoStage === 1) { // Guessed after 25s video
        points = 100 + timeBonus;
      } else if (videoStage === 2) { // Guessed after 35s video
        points = 50 + timeBonus;
      }
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
  }, [currentVideo, isGuessingPhase, videoStage, timerInitialValue, gameEnded]);


  const handleTimerTimeout = useCallback(() => {
    if (gameEnded || !currentVideo) return;

    setIsTimerRunning(false); // Stop timer
    setIsGuessingPhase(false); // Disable guessing area

    if (videoStage < 2) { // If there are more hints to give (max 2 hints after initial)
      setVideoStage((prevStage) => prevStage + 1); // Move to next video stage (e.g., 0 to 1, or 1 to 2)
      // The video will now play the next segment
    } else { // No more hints, 45 seconds of video are up, or final guess timed out
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
        setCurrentRound((prevRound) => prevRound + 1); // Advance to the next round
      });
    }
  }, [videoStage, currentVideo, gameEnded]);

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
          video.options.includes(video.answer)
        );

        if (validVideos.length < MAX_ROUNDS) {
          Swal.fire({
            title: 'Not Enough Videos!',
            text: `You only have ${validVideos.length} valid videos in Firestore. Please add at least ${MAX_ROUNDS} for a full game.`,
            icon: 'warning',
            confirmButtonText: 'Understood'
          });
        }
        setVideos(shuffleArray(validVideos)); // Shuffle and set valid videos
      } catch (error) {
        console.error("Error fetching videos:", error);
        Swal.fire('Error', 'Failed to load videos. Please check your internet connection or Firebase setup.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [shuffleArray]); // Added shuffleArray to dependencies

  // Effect to manage game flow (start new round or end game)
  // This useEffect now correctly calls startNewRound and endGame after they're defined.
  useEffect(() => {
    if (isLoading || gameEnded) return;

    if (videos.length > 0 && currentRound <= MAX_ROUNDS) {
      startNewRound();
    } else if (currentRound > MAX_ROUNDS) {
      endGame();
    }
  }, [videos, currentRound, isLoading, gameEnded, startNewRound, endGame]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <p className="text-white text-3xl animate-pulse">Loading AdVenture Guess...</p>
      </div>
    );
  }

  // Calculate the actual start time for the *current* video snippet being played
  let videoSegmentStartTime = (currentVideo?.startTime || 0); // Base start time from Firestore

  if (videoStage === 1) {
    videoSegmentStartTime += INITIAL_VIDEO_DURATION; // Start after the first 15s
  } else if (videoStage === 2) {
    videoSegmentStartTime += INITIAL_VIDEO_DURATION + HINT_VIDEO_DURATION; // Start after the first 25s
  }

  // Calculate the end time of the current snippet (relative to its start)
  let videoSegmentDuration = INITIAL_VIDEO_DURATION;
  if (videoStage === 1 || videoStage === 2) {
    videoSegmentDuration = HINT_VIDEO_DURATION;
  }
  const videoEndTime = videoSegmentStartTime + videoSegmentDuration;

  const shouldVideoPlay = !isGuessingPhase && !gameEnded;

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
            startTime={videoSegmentStartTime} // Pass the dynamically calculated start time
            endTime={videoEndTime}
            onEnded={handleVideoSnippetEnded}
            isPlaying={shouldVideoPlay}
            // This key will force the VideoPlayer component to re-mount (reset)
            // every time the youtubeId (new video) or the videoStage (new segment within same video) changes.
            key={`round-${currentRound}-${currentVideo.youtubeId}-${videoStage}`}
          />
        )}
      </div>

      <div className="mt-8 flex flex-col items-center w-full max-w-4xl">
        {isGuessingPhase && currentVideo ? (
          <>
            <Timer
              initialTime={timerInitialValue}
              onTimeout={handleTimerTimeout}
              isRunning={isTimerRunning}
            />
            <GuessingArea
              options={shuffleArray([...currentVideo.options])} // Shuffle options each time
              onGuess={handleGuess}
              disabled={!isGuessingPhase || !isTimerRunning}
            />
          </>
        ) : (
          !gameEnded && (
            <p className="text-white text-2xl mt-4 animate-pulse">
              {videoStage === 0 ? "Watching the ad snippet..." : "Playing a hint..."}
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Game;