import { useState, useEffect, useCallback } from 'react';
import type { AutocompleteResultItem } from '../components/GitHubAutocomplete/types';
import { searchGitHub } from '../services/githubApi';
import { getCachedResults, cacheResults } from '../utils/cacheUtils';
import { useTypingAwareDebounce } from './useTypingAwareDebounce';

interface UseGitHubSearchProps {
  debounceTime?: number;
  minChars?: number;
  typingThreshold?: number;
}

export const useGitHubSearch = ({ 
  debounceTime = 1500,
  minChars = 3,
  typingThreshold = 500 
}: UseGitHubSearchProps = {}) => {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedQuery = useTypingAwareDebounce(query, debounceTime, typingThreshold);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setError(null);
    setShowDropdown(value.length >= minChars);
    
    if (value.length < minChars) {
      setResults([]);
    }
  }, []);

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsLoading(false);
    setError(null);
    setSelectedIndex(-1);
    setShowDropdown(false);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      const trimmedQuery = debouncedQuery.trim();
      
      if (trimmedQuery.length < minChars) {
        return;
      }

      const cachedResults = getCachedResults(trimmedQuery);
      
      if (cachedResults) {
        setResults(cachedResults);
        setShowDropdown(cachedResults.length > 0);
        return;
      }

      try {
        setIsLoading(true);
        
        const newResults = await searchGitHub(trimmedQuery);
        
        setResults(newResults);
        setIsLoading(false);
        setShowDropdown(newResults.length > 0);
        
        cacheResults(trimmedQuery, newResults);
      } catch (error) {
        let errorMessage = 'An error occurred while searching';
        
        if (error instanceof Error) {
          if (error.message.includes('rate limit exceeded')) {
            errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
          } else if (error.message.includes('Network Error')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
        setShowDropdown(true);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return {
    query,
    results,
    isLoading,
    error,
    selectedIndex,
    showDropdown,
    handleInputChange,
    setSelectedIndex,
    setShowDropdown,
    resetSearch,
  };
};
