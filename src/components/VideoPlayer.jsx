// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import YouTubePlayer from 'react-player/youtube'; // Renamed to avoid conflict with `YouTube` global

const VideoPlayer = ({ youtubeId, startTime = 0, endTime, onEnded, isPlaying }) => {
  const playerRef = useRef(null); // Ref to hold the react-player instance
  const commandTimeoutRef = useRef(null); // Ref to hold the timeout for commands

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
        // Attempt to pause the internal YouTube player to stop playback exactly at endTime
        const internalPlayer = playerRef.current.getInternalPlayer();
        if (internalPlayer && typeof internalPlayer.pauseVideo === 'function') {
          internalPlayer.pauseVideo();
        }
      }
      console.log(`Video ID ${youtubeId} snippet ended at ${endTime}s.`);
      onEnded(); // Trigger the end action in Game.jsx
    }
  }, [playerLoaded, isPlaying, endTime, onEnded, youtubeId]);


  // Effect to manage play/pause and seeking based on props
  useEffect(() => {
    // Clear any pending timeout when dependencies change
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }

    if (playerLoaded && playerRef.current) {
      console.log(`VideoPlayer Effect: playerLoaded: ${playerLoaded}, isPlaying: ${isPlaying}, youtubeId: ${youtubeId}, startTime: ${startTime}. Scheduling commands.`);

      // Introduce a small delay to ensure the player's internal state is fully stable
      commandTimeoutRef.current = setTimeout(() => {
        if (!playerRef.current) return; // Guard against unmount during timeout

        try {
          // React-Player's seekTo method is high-level
          playerRef.current.seekTo(startTime, 'seconds');

          // Ensure play/pause based on `isPlaying` prop.
          // `react-player`'s `playing` prop below also handles this, but this is for immediate action.
          const internalPlayer = playerRef.current.getInternalPlayer();
          if (internalPlayer) {
              if (isPlaying) {
                  if (typeof internalPlayer.playVideo === 'function') {
                      console.log(`Attempting to play video ${youtubeId} at ${startTime} after delay.`);
                      internalPlayer.playVideo();
                  }
              } else {
                  if (typeof internalPlayer.pauseVideo === 'function') {
                      console.log(`Attempting to pause video ${youtubeId} after delay.`);
                      internalPlayer.pauseVideo();
                  }
              }
          }
        } catch (error) {
          console.error("Error sending command to React-Player after delay:", error);
        }
      }, 100); // A small delay, e.g., 100ms. Adjust if needed.
    } else {
      console.log(`VideoPlayer Effect: Player not fully loaded for ID: ${youtubeId}. Skipping commands.`);
    }

    // Cleanup function for this useEffect: clear the timeout if the component unmounts
    // or dependencies change before the timeout fires.
    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
    };
  }, [isPlaying, youtubeId, startTime, playerLoaded]);


  // Cleanup any lingering timeouts and pause video on component unmount
  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      // Attempt to pause the video when component unmounts (e.g., game ends)
      if (playerRef.current && playerRef.current.getInternalPlayer()) {
        const internalPlayer = playerRef.current.getInternalPlayer();
        if (internalPlayer && typeof internalPlayer.pauseVideo === 'function') {
            internalPlayer.pauseVideo();
        }
      }
    };
  }, []);

  // --- Cropping Dimensions ---
  // These values are approximate and may need slight adjustment based on
  // the exact embed proportions and how much of the title/logo is visible.
  const cropTopPercentage = 25; // Percentage of player height to hide from the top (title/logo)
  const playerHeightScale = 100 + cropTopPercentage + 2; // Make player taller to compensate for top crop + a little extra for bottom controls
  const playerTopOffset = -(cropTopPercentage / 2 + 1); // Shift up by about half the cropped amount + a little extra


  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      {/* This inner div acts as the cropping window */}
      <div
        className="absolute inset-0"
        style={{
          overflow: 'hidden',
        }}
      >
        <YouTubePlayer
          ref={playerRef}
          url={`https://www.youtube.com/embed/${youtubeId}`} // Standard YouTube URL format for react-player
          playing={isPlaying} // react-player's main control for play/pause
          controls={false}    // react-player prop to hide built-in controls
          config={{
            youtube: {
              playerVars: {
                autoplay: 1,        // Autoplay the video (still respecting `playing` prop)
                controls: 0,        // YouTube API param to hide native controls
                disablekb: 1,       // Disable keyboard controls (spacebar, arrows)
                modestbranding: 1,  // Show smaller YouTube logo
                rel: 0,             // Do not show related videos at end
                showinfo: 0,        // DEPRECATED: Often still included for compatibility
                fs: 0,              // Disable fullscreen button
                iv_load_policy: 3,  // Don't show annotations
                autohide: 1,        // Hide controls when mouse is out (helps with minimal UI)
                // start is controlled by seekTo in useEffect for dynamic snippets
              },
            },
          }}
          onReady={handleReady}
          onProgress={handleProgress}
          // onEnded fires when the *entire* video ends. Our handleProgress handles snippet endings.
          // Only call onEnded if it wasn't already handled by snippet logic and it should be.
          onEnded={() => {
            if (isPlaying) { // Prevent calling if already paused/ended by game logic
               console.log(`React-Player: Full video ${youtubeId} naturally ended.`);
               onEnded();
            }
          }}
          width="100%"
          height={`${playerHeightScale}%`} // Make the player element taller
          style={{
            position: 'absolute',
            top: `${playerTopOffset}%`, // Shift up to hide top elements
            left: 0,
            // You can also adjust width and left for horizontal cropping if needed
          }}
          // Key is important to force component remount for new YouTube IDs
          key={youtubeId}
        />
      </div>
      <div className="absolute inset-0 border-4 border-purple-600 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default VideoPlayer;