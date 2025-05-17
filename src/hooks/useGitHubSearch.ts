/**
 * useGitHubSearch hook
 * Custom hook that handles GitHub search functionality with caching and state management
 */
import { useReducer, useEffect, useCallback } from 'react';
import type { AutocompleteResultItem, SearchState, SearchAction } from '../components/GitHubAutocomplete/types';
import { searchGitHub } from '../services/githubApi';
import { getCachedResults, cacheResults } from '../utils/cacheUtils';
import { useDebounce } from './useDebounce';

// Initial state
const initialState: SearchState = {
  query: '',
  results: [],
  isLoading: false,
  error: null,
  selectedIndex: -1,
  showDropdown: false,
};

/**
 * Search reducer function
 * Handles state updates for search actions
 */
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload,
        // Reset selected index when query changes
        selectedIndex: -1,
        // Show dropdown if query length is 3+ characters
        showDropdown: action.payload.length >= 3,
        // Clear error when query changes
        error: null,
      };
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        isLoading: false,
        // Ensure dropdown is visible when results arrive
        showDropdown: action.payload.length > 0,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        // Clear errors when starting a new search
        error: action.payload ? null : state.error,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        // Keep showing dropdown to display error message
        showDropdown: action.payload !== null,
      };
    case 'SET_SELECTED_INDEX':
      return {
        ...state,
        selectedIndex: action.payload,
      };
    case 'SET_SHOW_DROPDOWN':
      return {
        ...state,
        showDropdown: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface UseGitHubSearchProps {
  debounceTime?: number;
}

/**
 * Custom hook for GitHub search functionality
 * 
 * @param props Hook configuration props
 * @returns Search state and methods
 */
export const useGitHubSearch = ({ debounceTime = 300 }: UseGitHubSearchProps = {}) => {
  // Set up reducer for search state
  const [state, dispatch] = useReducer(searchReducer, initialState);
  
  // Debounced query to avoid excess API calls
  const debouncedQuery = useDebounce(state.query, debounceTime);
  
  /**
   * Handle search input changes
   */
  const handleInputChange = useCallback((value: string) => {
    dispatch({ type: 'SET_QUERY', payload: value });
    
    if (value.length < 3) {
      dispatch({ type: 'SET_RESULTS', payload: [] });
    }
  }, []);

  /**
   * Update selected index for keyboard navigation
   */
  const setSelectedIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_INDEX', payload: index });
  }, []);

  /**
   * Show/hide dropdown 
   */
  const setShowDropdown = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_DROPDOWN', payload: show });
  }, []);

  /**
   * Reset search state
   */
  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  /**
   * Handle GitHub search when query changes
   */
  useEffect(() => {
    const performSearch = async () => {
      const query = debouncedQuery.trim();
      
      // Only search when query is 3+ characters
      if (query.length < 3) {
        return;
      }

      // Try to get results from cache first
      const cachedResults = getCachedResults(query);
      
      if (cachedResults) {
        dispatch({ type: 'SET_RESULTS', payload: cachedResults });
        return;
      }

      // No cached results, perform API search
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const results = await searchGitHub(query);
        
        dispatch({ type: 'SET_RESULTS', payload: results });
        
        // Cache results for future use
        cacheResults(query, results);
      } catch (error) {
        let errorMessage = 'An error occurred while searching';
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('rate limit exceeded')) {
            errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
          } else if (error.message.includes('Network Error')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        }
        
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return {
    ...state,
    handleInputChange,
    setSelectedIndex,
    setShowDropdown,
    resetSearch,
  };
};
