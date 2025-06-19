// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import YouTubePlayer from 'react-player/youtube';

const VideoPlayer = ({ youtubeId, startTime = 0, endTime, onEnded, isPlaying }) => {
  const playerRef = useRef(null);
  const timeoutRef = useRef(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  // We will *not* use playerVars.controls: 0 here, as the cropping handles it.
  // We'll also specifically avoid modestbranding or showinfo, letting the crop do the work.
  // This can sometimes be more robust than relying on playerVars.
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,       // Keep this for now, as it might help even with cropping
      disablekb: 1,
      modestbranding: 1, // Keep this too, it removes the YouTube logo from the controls bar (which we hide anyway)
      rel: 0,
      showinfo: 0,       // Keep this just in case, though deprecated
      fs: 0,
      iv_load_policy: 3,
      autohide: 1,
      start: startTime,
    },
  };

  const handleReady = useCallback(() => {
    setPlayerLoaded(true);
    console.log(`React-Player internal player ready for ID: ${youtubeId}`);
  }, [youtubeId]);

  const handleProgress = useCallback((state) => {
    if (playerLoaded && isPlaying && endTime && state.playedSeconds >= endTime) {
      if (playerRef.current) {
        playerRef.current.seekTo(endTime, 'seconds');
        playerRef.current.getInternalPlayer().pauseVideo();
      }
      onEnded();
    }
  }, [playerLoaded, isPlaying, endTime, onEnded]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (playerLoaded && playerRef.current) {
      console.log(`React-Player Effect: playerLoaded: ${playerLoaded}, isPlaying: ${isPlaying}, youtubeId: ${youtubeId}, startTime: ${startTime}. Scheduling commands.`);

      timeoutRef.current = setTimeout(() => {
        if (!playerRef.current) return;

        try {
          playerRef.current.seekTo(startTime, 'seconds');
          // The `playing` prop below will handle play/pause based on `isPlaying`
        } catch (error) {
          console.error("Error sending command to React-Player after delay:", error);
        }
      }, 50);
    } else {
      console.log(`React-Player Effect: Not fully loaded for ID: ${youtubeId}. Skipping commands.`);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, youtubeId, startTime, playerLoaded]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (playerRef.current && playerRef.current.getInternalPlayer()) {
        playerRef.current.getInternalPlayer().pauseVideo();
      }
    };
  }, []);

  // --- Cropping Dimensions ---
  // These values are approximate and may need slight adjustment based on
  // the exact embed proportions and how much of the title/logo is visible.
  const cropTopPercentage = 25; // Percentage of player height to hide from the top (title)
  const playerHeightScale = 100 + cropTopPercentage; // Make player taller to compensate for top crop

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      {/* This inner div acts as the cropping window */}
      <div
        className="absolute inset-0"
        style={{
          overflow: 'hidden',
          // Optionally, if you want very precise height control for cropping:
          // height: '100%',
          // width: '100%'
        }}
      >
        <YouTubePlayer
          ref={playerRef}
          url={`https://www.youtube.com/embed/${youtubeId}`}
          playing={isPlaying}
          // We keep controls={false} on react-player just to be safe, but the cropping will do most of the work.
          controls={false}
          config={{
            youtube: {
              playerVars: opts.playerVars, // Use the opts.playerVars directly
            },
          }}
          onReady={handleReady}
          onProgress={handleProgress}
          onEnded={() => {
            if (isPlaying) {
              console.log(`React-Player: Full video ${youtubeId} naturally ended.`);
              onEnded();
            }
          }}
          // Make the player slightly taller to effectively crop the top
          // The 16:9 aspect ratio is for the *visible* area.
          // We make the actual player taller so its bottom aligns with our container.
          width="100%"
          height={`${playerHeightScale}%`}
          style={{
            position: 'absolute',
            top: `-${cropTopPercentage / 2}%`, // Shift up by half the cropped top amount to center video content
            left: 0,
            // If you need to crop sides, you'd adjust width and left/right margin/position.
            // Example for cropping 2% from each side:
            // width: `${100 + 4}%`,
            // left: '-2%',
          }}
          key={youtubeId}
        />
      </div>
      <div className="absolute inset-0 border-4 border-purple-600 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default VideoPlayer;