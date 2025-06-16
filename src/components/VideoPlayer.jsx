// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-player/youtube';

const VideoPlayer = ({ youtubeId, startTime = 0, endTime, onEnded, isPlaying }) => {
  const playerRef = useRef(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  // Use a state to track if player is ready to seek
  const [playerReady, setPlayerReady] = useState(false);


  // Effect to seek when startTime or youtubeId changes, and player is ready
  useEffect(() => {
    if (playerReady && playerRef.current && isPlaying) {
      console.log(`Seeking to: ${startTime} for ${youtubeId}`);
      playerRef.current.seekTo(startTime, 'seconds');
    }
  }, [youtubeId, startTime, playerReady, isPlaying]); // Added playerReady and isPlaying to dependencies

  // Handle player readiness
  const handleReady = () => {
    setPlayerReady(true);
    if (playerRef.current && isPlaying) {
      playerRef.current.seekTo(startTime, 'seconds');
    }
  };


  const handleProgress = (state) => {
    setCurrentPlaybackTime(state.playedSeconds);
    // Only check endTime condition if video is actively playing and playerReady
    if (playerReady && isPlaying && endTime && state.playedSeconds >= endTime) {
      playerRef.current.seekTo(endTime, 'seconds'); // Snap to end to prevent overshooting
      onEnded(); // Trigger the end action
    }
  };

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      <YouTube
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${youtubeId}`} // Corrected standard YouTube URL
        playing={isPlaying}
        controls={false} // Hide controls
        config={{
          youtube: {
            playerVars: {
              autoplay: 1, // Autoplay, but we control playing prop
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              disablekb: 1,
              start: startTime, // Initial start time (seekTo will handle subsequent jumps)
            },
          },
        }}
        onReady={handleReady} // Use the new handleReady
        onProgress={handleProgress}
        onEnded={() => {
          // This fires if the actual video ends, but we're mostly relying on onProgress for snippets
          if (isPlaying) { // Only call onEnded if it was supposed to be playing
             onEnded();
          }
        }}
        width="100%"
        height="100%"
      />
      <div className="absolute inset-0 border-4 border-purple-600 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default VideoPlayer;