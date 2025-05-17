/**
 * Cache utilities for storing search results
 * Reduces unnecessary API calls by caching previous search results
 */
import type { AutocompleteResultItem, CacheItem } from '../components/GitHubAutocomplete/types';

// Cache expiration time in milliseconds (24 godziny dla zmniejszenia liczby zapytań API)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Store search results in local storage
 * 
 * @param query Search query
 * @param results Search results
 */
export const cacheResults = (query: string, results: AutocompleteResultItem[]): void => {
  try {
    const cacheItem: CacheItem = {
      timestamp: Date.now(),
      results,
    };
    
    localStorage.setItem(`github-search-${query}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Error caching results:', error);
    // Fail silently - caching is an optimization, not a critical feature
  }
};

/**
 * Retrieve cached search results
 * 
 * @param query Search query
 * @returns Cached results or null if not found or expired
 */
export const getCachedResults = (query: string): AutocompleteResultItem[] | null => {
  try {
    const cachedData = localStorage.getItem(`github-search-${query}`);
    
    if (!cachedData) {
      return null;
    }
    
    const cacheItem: CacheItem = JSON.parse(cachedData);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - cacheItem.timestamp > CACHE_EXPIRATION) {
      // Clean up expired cache
      localStorage.removeItem(`github-search-${query}`);
      return null;
    }
    
    return cacheItem.results;
  } catch (error) {
    console.warn('Error retrieving cached results:', error);
    return null;
  }
};

/**
 * Clear all cached search results
 */
export const clearCache = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Find all cached search keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('github-search-')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
};

/**
 * Dane fallbackowe do użycia gdy limit API GitHub zostanie wyczerpany
 * Zapewnia podstawowe wyniki dla popularnych wyszukiwań, aby uniknąć pustego interfejsu
 */
const FALLBACK_RESULTS: Record<string, AutocompleteResultItem[]> = {
  // Przykładowe wyniki dla "react"
  'react': [
    {
      id: 'repo-10270250',
      name: 'react',
      type: 'repository' as const,
      url: 'https://github.com/facebook/react',
      avatarUrl: 'https://avatars.githubusercontent.com/u/69631?v=4',
      description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    },
    {
      id: 'repo-70107786',
      name: 'react-native',
      type: 'repository' as const,
      url: 'https://github.com/facebook/react-native',
      avatarUrl: 'https://avatars.githubusercontent.com/u/69631?v=4',
      description: 'A framework for building native applications using React.',
    },
    {
      id: 'user-1566403',
      name: 'react',
      type: 'user' as const,
      url: 'https://github.com/react',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1566403?v=4',
    },
  ],
  // Przykładowe wyniki dla "javascript"
  'javascript': [
    {
      id: 'repo-1062897',
      name: 'javascript',
      type: 'repository' as const,
      url: 'https://github.com/airbnb/javascript',
      avatarUrl: 'https://avatars.githubusercontent.com/u/698437?v=4',
      description: 'JavaScript Style Guide',
    },
    {
      id: 'user-1700322',
      name: 'javascript',
      type: 'user' as const,
      url: 'https://github.com/javascript',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1700322?v=4',
    },
  ],
};

/**
 * Pobierz dane fallbackowe dla danego zapytania
 * 
 * @param query Zapytanie wyszukiwania
 * @returns Dane fallbackowe lub pustą tablice jeśli nie znaleziono
 */
export const getFallbackResults = (query: string): AutocompleteResultItem[] => {
  // Sprawdzenie czy mamy dokładne dopasowanie
  if (FALLBACK_RESULTS[query]) {
    return FALLBACK_RESULTS[query];
  }
  
  // Sprawdzenie czy mamy częściowe dopasowanie
  for (const key of Object.keys(FALLBACK_RESULTS)) {
    if (query.includes(key) || key.includes(query)) {
      return FALLBACK_RESULTS[key];
    }
  }
  
  // Brak dopasowania, zwracamy pustą tablicę
  return [];
};
