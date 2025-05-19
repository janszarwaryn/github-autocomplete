import React, { useState, useEffect } from 'react';

interface ResetCountdownTimerProps {
  resetTimestamp: number;
  className?: string;
}


const ResetCountdownTimer: React.FC<ResetCountdownTimerProps> = ({ 
  resetTimestamp, 
  className = '' 
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = Math.max(0, resetTimestamp - now);
      setSecondsRemaining(timeLeft);
    };


    calculateTimeRemaining();
    
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(intervalId);
  }, [resetTimestamp]);
  
  let timerColor = 'text-red-500';
  if (secondsRemaining < 10) {
    timerColor = 'text-green-500';
  } else if (secondsRemaining < 30) {
    timerColor = 'text-yellow-500';
  }
  
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
