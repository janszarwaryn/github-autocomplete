/**
 * ResetCountdownTimer component
 * Displays a real-time countdown until the GitHub API rate limit resets
 * Color-coded based on time remaining
 */
import React, { useState, useEffect } from 'react';

interface ResetCountdownTimerProps {
  resetTimestamp: number;
  className?: string;
}

/**
 * ResetCountdownTimer component
 * Shows seconds remaining until API rate limit reset with color coding
 */
const ResetCountdownTimer: React.FC<ResetCountdownTimerProps> = ({ 
  resetTimestamp, 
  className = '' 
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const timeLeft = Math.max(0, resetTimestamp - now);
      setSecondsRemaining(timeLeft);
    };

    // Calculate immediately
    calculateTimeRemaining();
    
    // Update every second
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [resetTimestamp]);
  
  // Determine color based on time remaining
  let timerColor = 'text-red-500';
  if (secondsRemaining < 10) {
    timerColor = 'text-green-500';
  } else if (secondsRemaining < 30) {
    timerColor = 'text-yellow-500';
  }
  
  // Format the time remaining as mm:ss
  const formatTimeRemaining = () => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span>Reset in: </span>
      <span className={`ml-1 font-bold ${timerColor}`}>
        {formatTimeRemaining()}
      </span>
    </div>
  );
};

export default ResetCountdownTimer;
