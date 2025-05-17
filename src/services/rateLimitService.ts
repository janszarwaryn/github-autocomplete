
import { useState, useEffect, useCallback } from 'react';


const RATE_LIMIT_KEY = 'github_rate_limit_info';
const RATE_LIMIT_EXCEEDED_KEY = 'github_rate_limit_exceeded';


export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetTimeString: string;
  isSearchAPI: boolean;
  exceeded: boolean;
}

type RateLimitCallback = (info: RateLimitInfo) => void;


let rateLimitSubscribers: RateLimitCallback[] = [];
let isRateLimitExceeded = false;
let currentRateLimit: RateLimitInfo = {
  limit: 10,
  remaining: 10,
  reset: 0,
  resetTimeString: '',
  isSearchAPI: true,
  exceeded: false
};


const saveRateLimitToStorage = (info: RateLimitInfo, exceeded: boolean): void => {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(info));
    localStorage.setItem(RATE_LIMIT_EXCEEDED_KEY, String(exceeded));
  } catch (error) {

  }
};


const loadRateLimitFromStorage = (): { info: RateLimitInfo | null, exceeded: boolean } => {
  try {
    const storedInfo = localStorage.getItem(RATE_LIMIT_KEY);
    const storedExceeded = localStorage.getItem(RATE_LIMIT_EXCEEDED_KEY);
    
    if (storedInfo) {
      const info = JSON.parse(storedInfo) as RateLimitInfo;
      const exceeded = storedExceeded === 'true';
      const now = Math.floor(Date.now() / 1000);
      
      if (info.reset > 0 && now >= info.reset) {
        localStorage.removeItem(RATE_LIMIT_KEY);
        localStorage.removeItem(RATE_LIMIT_EXCEEDED_KEY);
        return { info: null, exceeded: false };
      }
      
      return { info, exceeded };
    }
  } catch (error) {

  }
  
  return { info: null, exceeded: false };
};


const checkAndResetRateLimit = (): boolean => {
  if (!isRateLimitExceeded) {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  
  if (currentRateLimit.reset > 0 && now >= currentRateLimit.reset) {
    isRateLimitExceeded = false;
    currentRateLimit = {
      ...currentRateLimit,
      exceeded: false,
      remaining: currentRateLimit.limit,
      reset: 0,
    };
    
    try {
      localStorage.removeItem(RATE_LIMIT_KEY);
      localStorage.removeItem(RATE_LIMIT_EXCEEDED_KEY);
    } catch (error) {
  
    }
    
    notifySubscribers();
    return true;
  }
  
  return false;
};


const notifySubscribers = () => {
  rateLimitSubscribers.forEach(callback => {
    callback({ ...currentRateLimit });
  });
};


const { info: storedRateLimit, exceeded: storedExceeded } = loadRateLimitFromStorage();
if (storedRateLimit) {
  currentRateLimit = storedRateLimit;
  isRateLimitExceeded = storedExceeded;
  
  if (isRateLimitExceeded && !currentRateLimit.exceeded) {
    currentRateLimit = {
      ...currentRateLimit,
      exceeded: true,
      remaining: 0
    };
  }
}


let resetCheckInterval: number | null = null;


const startResetCheckInterval = () => {
  if (resetCheckInterval === null) {
    resetCheckInterval = window.setInterval(() => {
      checkAndResetRateLimit();
    }, 1000) as unknown as number;
  }
};


startResetCheckInterval();
checkAndResetRateLimit();




export const subscribeToRateLimitChanges = (callback: RateLimitCallback): () => void => {
  rateLimitSubscribers.push(callback);
  callback({ ...currentRateLimit });
  
  return () => {
    const index = rateLimitSubscribers.indexOf(callback);
    if (index !== -1) {
      rateLimitSubscribers.splice(index, 1);
    }
  };
};


export const updateRateLimitInfo = (updates: Partial<RateLimitInfo>): void => {
  currentRateLimit = {
    ...currentRateLimit,
    ...updates
  };
  
  if (updates.remaining !== undefined && updates.remaining <= 0) {
    currentRateLimit.exceeded = true;
    isRateLimitExceeded = true;
  }
  
  saveRateLimitToStorage(currentRateLimit, isRateLimitExceeded);
  notifySubscribers();
};


export const isRateLimitError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('rate limit') || 
         lowerMessage.includes('api rate') || 
         lowerMessage.includes('api limit');
};


export const setRateLimitExceeded = (exceeded: boolean = true): void => {
  isRateLimitExceeded = exceeded;
  
  if (exceeded) {
    updateRateLimitInfo({ 
      exceeded: true,
      remaining: 0
    });
  } else {
    resetRateLimitExceeded();
  }
};


export const extractRateLimitInfo = (response: Response): void => {

  const currentRemaining = currentRateLimit.remaining;
  const newRemaining = Math.max(0, currentRemaining - 1);
  

  const requestUrl = response.url || '';
  const isSearchRequest = requestUrl.includes('/search/');
  

  const rateLimitLimit = response.headers.get('x-ratelimit-limit');
  const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
  const rateLimitReset = response.headers.get('x-ratelimit-reset');
  
  if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
    const limit = parseInt(rateLimitLimit, 10);
    const remaining = parseInt(rateLimitRemaining, 10);
    const reset = parseInt(rateLimitReset, 10);
    

    const resetDate = new Date(reset * 1000);
    const resetTimeString = resetDate.toLocaleTimeString();
    

    const actualRemaining = Math.min(newRemaining, remaining);
    
    updateRateLimitInfo({
      limit,
      remaining: actualRemaining,
      reset,
      resetTimeString,
      isSearchAPI: isSearchRequest,
      exceeded: actualRemaining <= 0
    });
  } else {

    updateRateLimitInfo({
      remaining: newRemaining,
      isSearchAPI: isSearchRequest,
      exceeded: newRemaining <= 0
    });
  }
};


export const getRateLimitInfo = (): RateLimitInfo => {
  return { ...currentRateLimit };
};


export const getIsRateLimitExceeded = (): boolean => {
  return isRateLimitExceeded || currentRateLimit.remaining <= 0;
};


export const resetRateLimitExceeded = (): void => {
  isRateLimitExceeded = false;
  updateRateLimitInfo({ exceeded: false });
  
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
    localStorage.removeItem(RATE_LIMIT_EXCEEDED_KEY);
  } catch (error) {

  }
};


export const useRateLimit = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>(getRateLimitInfo());
  
  useEffect(() => {
    const unsubscribe = subscribeToRateLimitChanges(newInfo => {
      setRateLimitInfo(newInfo);
    });
    
    return unsubscribe;
  }, []);
  
  const reset = useCallback(() => {
    resetRateLimitExceeded();
  }, []);
  
  return {
    rateLimitInfo,
    isExceeded: rateLimitInfo.exceeded || rateLimitInfo.remaining <= 0,
    reset
  };
};
