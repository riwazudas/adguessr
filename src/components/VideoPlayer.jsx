// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import YouTubePlayer from 'react-player/youtube'; // Renamed to avoid conflict with `YouTube` global

const VideoPlayer = ({ youtubeId, startTime = 0, endTime, onEnded, isPlaying }) => {
  const playerRef = useRef(null); // Ref to hold the react-player instance
  const timeoutRef = useRef(null); // Ref to hold the timeout for commands

  const [playerLoaded, setPlayerLoaded] = useState(false); // Indicates if the internal player is ready

  // Callback for when the internal player is ready
  const handleReady = useCallback(() => {
    setPlayerLoaded(true);
    console.log(`React-Player internal player ready for ID: ${youtubeId}`);
  }, [youtubeId]);

  // Callback for progress updates to check custom endTime
  const handleProgress = useCallback((state) => {
    // Only check endTime condition if player is loaded, actively playing, and endTime is defined
    if (playerLoaded && isPlaying && endTime && state.playedSeconds >= endTime) {
      if (playerRef.current) {
        playerRef.current.seekTo(endTime, 'seconds'); // Snap to end to prevent overshooting
        playerRef.current.getInternalPlayer().pauseVideo(); // Pause the actual YouTube video
      }
      onEnded(); // Trigger the end action in Game.jsx
    }
  }, [playerLoaded, isPlaying, endTime, onEnded]);


  // Effect to manage play/pause and seeking based on props
  useEffect(() => {
    // Clear any pending timeout when dependencies change
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (playerLoaded && playerRef.current) {
      console.log(`React-Player Effect: playerLoaded: ${playerLoaded}, isPlaying: ${isPlaying}, youtubeId: ${youtubeId}, startTime: ${startTime}`);

      // Introduce a small delay to ensure the player's internal state is fully stable
      timeoutRef.current = setTimeout(() => {
        if (!playerRef.current) return; // Guard against unmount during timeout

        try {
          // React-Player's seekTo method is high-level, no need for getInternalPlayer() here
          playerRef.current.seekTo(startTime, 'seconds');

          // Control play/pause using react-player's `play` prop
          // (The `playing` prop below handles this, so explicit playVideo/pauseVideo
          // calls are often not needed here unless complex state management requires it).
          // However, for immediate response and to be super sure:
          if (isPlaying) {
            console.log(`Attempting to play video ${youtubeId} after delay.`);
            // You can use getInternalPlayer().playVideo() if react-player's 'playing' prop isn't responsive enough
            // playerRef.current.getInternalPlayer().playVideo();
          } else {
            console.log(`Attempting to pause video ${youtubeId} after delay.`);
            // playerRef.current.getInternalPlayer().pauseVideo();
          }
        } catch (error) {
          console.error("Error sending command to React-Player after delay:", error);
        }
      }, 50); // A very small delay, 50ms. Adjust if needed.
    } else {
      console.log(`React-Player Effect: Not fully loaded for ID: ${youtubeId}. Skipping commands.`);
    }

    // Cleanup function for this useEffect
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, youtubeId, startTime, playerLoaded]);


  // Cleanup any lingering timeouts on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (playerRef.current && playerRef.current.getInternalPlayer()) {
        // Optional: stop the video when unmounting
        playerRef.current.getInternalPlayer().pauseVideo();
      }
    };
  }, []);


  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      <YouTubePlayer
        ref={playerRef}
        url={`https://www.youtube.com/embed/${youtubeId}`} // Standard YouTube URL format
        playing={isPlaying} // react-player's main control for play/pause
        controls={false}    // react-player prop to hide built-in controls
        config={{
          youtube: {
            playerVars: {
              autoplay: 1,       // Autoplay the video (still respecting `playing` prop)
              controls: 0,       // YouTube API param to hide native controls
              disablekb: 1,      // Disable keyboard controls (spacebar, arrows)
              modestbranding: 1, // Show smaller YouTube logo
              rel: 0,            // Do not show related videos at end
              showinfo: 0,       // DEPRECATED: Often still included, but modestbranding/controls=0 are key
              fs: 0,             // Disable fullscreen button
              iv_load_policy: 3, // Don't show annotations
              autohide: 1,       // Hide controls when mouse is out (helps with minimal UI)
              // start is better controlled by seekTo in useEffect for dynamic snippets
            },
          },
        }}
        onReady={handleReady}
        onProgress={handleProgress}
        // Note: react-player's onEnded fires when the *entire* video ends,
        // our handleProgress logic covers snippet endings.
        onEnded={() => {
          // This will fire if the video plays to its absolute end, not just our snippet end.
          // Your handleProgress handles the snippet specific ending.
          // Only call onEnded if it wasn't already handled by snippet logic and it should be.
          if (isPlaying) { // Prevent calling if already paused/ended by game logic
             console.log(`React-Player: Full video ${youtubeId} naturally ended.`);
             onEnded();
          }
        }}
        width="100%"
        height="100%"
        // Key is important to force component remount for new YouTube IDs
        key={youtubeId}
      />
      <div className="absolute inset-0 border-4 border-purple-600 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default VideoPlayer;