import type { AutocompleteResultItem, CacheItem } from '../components/GitHubAutocomplete/types';

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

export const cacheResults = (query: string, results: AutocompleteResultItem[]): void => {
  try {
    const cacheItem: CacheItem = {
      timestamp: Date.now(),
      results,
    };
    
    localStorage.setItem(`github-search-${query}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Error caching results:', error);
  }
};
export const getCachedResults = (query: string): AutocompleteResultItem[] | null => {
  try {
    const cachedData = localStorage.getItem(`github-search-${query}`);
    
    if (!cachedData) {
      return null;
    }
    
    const cacheItem: CacheItem = JSON.parse(cachedData);
    const now = Date.now();
    
    if (now - cacheItem.timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(`github-search-${query}`);
      return null;
    }
    
    return cacheItem.results;
  } catch (error) {
    console.warn('Error retrieving cached results:', error);
    return null;
  }
};


export const clearCache = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('github-search-')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
};
const FALLBACK_RESULTS: Record<string, AutocompleteResultItem[]> = {
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
export const getFallbackResults = (query: string): AutocompleteResultItem[] => {
  if (FALLBACK_RESULTS[query]) {
    return FALLBACK_RESULTS[query];
  }
  
  for (const key of Object.keys(FALLBACK_RESULTS)) {
    if (query.includes(key) || key.includes(query)) {
      return FALLBACK_RESULTS[key];
    }
  }
  
  return [];
};
