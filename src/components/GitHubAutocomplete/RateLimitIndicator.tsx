import React, { useState, useEffect } from 'react';
import { getRateLimitInfo, subscribeToRateLimitChanges } from '../../services/githubApi';

interface RateLimitIndicatorProps {
  className?: string;
}

interface ResetButtonProps {
  resetTimestamp: number;
  resetTimeString: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({ resetTimestamp, resetTimeString }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [hasReset, setHasReset] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = Math.max(0, resetTimestamp - now);
      setSecondsRemaining(timeLeft);

      if (timeLeft === 0 && !hasReset && resetTimestamp > 0) {
        setHasReset(true);
        console.log('Rate limit reset time reached in UI component');
      }
    };

    calculateTimeRemaining();

    const intervalId = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [resetTimestamp, hasReset]);

  useEffect(() => {
    setHasReset(false);
  }, [resetTimestamp]);

  let buttonColorClass = 'bg-red-500 bg-opacity-20 text-red-700';
  if (secondsRemaining < 10) {
    buttonColorClass = 'bg-green-500 bg-opacity-20 text-green-700';
  } else if (secondsRemaining < 30) {
    buttonColorClass = 'bg-yellow-500 bg-opacity-20 text-yellow-700';
  }

  const buttonText = secondsRemaining > 0 
    ? `Auto Reset in ${secondsRemaining}s`
    : 'API Ready';

  return (
    <button 
      disabled 
      className={`px-2 py-0.5 text-xs rounded cursor-default ${buttonColorClass}`}
      title={secondsRemaining > 0 ? `Automatic reset at ${resetTimeString}` : 'API is ready to use'}
    >
      {buttonText}
    </button>
  );
};

const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({ className = '' }) => {
  const [rateLimitInfo, setRateLimitInfo] = useState(getRateLimitInfo());
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    const unsubscribe = subscribeToRateLimitChanges(newRateLimitInfo => {
      console.log('Rate limit updated:', newRateLimitInfo);
      setRateLimitInfo(newRateLimitInfo);
      setLastUpdated(Date.now());
    });

    return unsubscribe;
  }, []);

  const percentRemaining = Math.floor((rateLimitInfo.remaining / rateLimitInfo.limit) * 100);

  let statusColor = 'bg-green-500';
  if (rateLimitInfo.exceeded || rateLimitInfo.remaining <= 0) {
    statusColor = 'bg-red-500';
  } else if (percentRemaining <= 30) {
    statusColor = 'bg-yellow-500';
  }

  const timePeriod = rateLimitInfo.isSearchAPI ? 'per minute' : 'per hour';

  useEffect(() => {
  }, [lastUpdated]);

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
          <span>Reset at: {rateLimitInfo.resetTimeString}</span>
        </span>
        {rateLimitInfo.reset > 0 && (
          <ResetButton resetTimestamp={rateLimitInfo.reset} resetTimeString={rateLimitInfo.resetTimeString} />
        )}
      </div>
    </div>
  );
};

export default RateLimitIndicator;
