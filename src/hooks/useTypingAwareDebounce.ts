import { useState, useEffect, useRef } from 'react';

export function useTypingAwareDebounce<T>(
  value: T, 
  delay: number,
  typingThreshold: number = 500
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const lastTypingTime = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    lastTypingTime.current = Date.now();
    
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      const timeSinceLastType = Date.now() - lastTypingTime.current;
      
      if (timeSinceLastType >= typingThreshold) {
        setDebouncedValue(value);
      } else {
        const remainingTime = typingThreshold - timeSinceLastType;
        timeoutRef.current = window.setTimeout(() => {
          setDebouncedValue(value);
        }, remainingTime);
      }
    }, delay);
    
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, typingThreshold]);
  
  return debouncedValue;
}
