import React, { useState, useEffect } from 'react';
import { useRateLimit } from '../../services/rateLimitService';

interface RateLimitIndicatorProps {
  className?: string;
}

interface ResetButtonProps {
  resetTimestamp: number;
  resetTimeString: string;
}

const ResetTimer: React.FC<ResetButtonProps> = ({ resetTimestamp, resetTimeString }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = Math.max(0, resetTimestamp - now);
      
      if (timeLeft === 0) {
        setTimeRemaining('Now');
        return;
      }
      

      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };


    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [resetTimestamp]);

  let timerColorClass = 'text-red-600';
  if (resetTimestamp === 0 || timeRemaining === 'Now') {
    timerColorClass = 'text-green-600 font-medium';
  } else if (timeRemaining.includes('s') && !timeRemaining.includes('m')) {
    const seconds = parseInt(timeRemaining.replace('s', ''), 10);
    if (seconds < 30) {
      timerColorClass = 'text-yellow-600';
    }
  }

  return (
    <span className={`${timerColorClass}`} title={`Reset at ${resetTimeString}`}>
      {timeRemaining}
    </span>
  );
};

const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({ className = '' }) => {
  const { rateLimitInfo, isExceeded } = useRateLimit();

  const percentRemaining = Math.floor((rateLimitInfo.remaining / rateLimitInfo.limit) * 100);

  let statusColor = 'bg-green-500';
  if (isExceeded || rateLimitInfo.exceeded || rateLimitInfo.remaining <= 0) {
    statusColor = 'bg-red-500';
  } else if (percentRemaining <= 30) {
    statusColor = 'bg-yellow-500';
  }

  const timePeriod = rateLimitInfo.isSearchAPI ? 'per minute' : 'per hour';

  return (
    <div className={`text-xs text-github-secondary mt-1 flex flex-wrap items-center justify-center gap-2 ${className}`} aria-live="polite">
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-1 ${statusColor}`} aria-hidden="true" />
        <span>
          <strong>{rateLimitInfo.exceeded ? 0 : rateLimitInfo.remaining}</strong> / {rateLimitInfo.limit} API requests {timePeriod}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="border-l pl-2 border-gray-300">
          <span>Reset in: </span>
          {rateLimitInfo.reset > 0 ? (
            <ResetTimer resetTimestamp={rateLimitInfo.reset} resetTimeString={rateLimitInfo.resetTimeString} />
          ) : (
            <span className="text-green-600 font-medium">Ready</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default RateLimitIndicator;
