import type { GitHubUserResponse, GitHubRepoResponse, AutocompleteResultItem } from '../components/GitHubAutocomplete/types';
import { getFallbackResults } from '../utils/cacheUtils';
const BASE_URL = 'https://api.github.com/search';
const RATE_LIMIT_KEY = 'github_rate_limit_info';
const RATE_LIMIT_EXCEEDED_KEY = 'github_rate_limit_exceeded';
type RateLimitCallback = (info: RateLimitInfo) => void;
const rateLimitSubscribers: RateLimitCallback[] = [];
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetTimeString: string;
  isSearchAPI: boolean;
  exceeded: boolean;
};
const saveRateLimitToStorage = (info: RateLimitInfo, exceeded: boolean): void => {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(info));
    localStorage.setItem(RATE_LIMIT_EXCEEDED_KEY, String(exceeded));
  } catch (error) {}
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
  } catch (error) {}
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
    } catch (error) {}
    rateLimitSubscribers.forEach(callback => {
      callback({ ...currentRateLimit });
    });
    return true;
  }
  return false;
};
let resetCheckInterval: number | null = null;
const startResetCheckInterval = () => {
  if (resetCheckInterval === null) {
    resetCheckInterval = window.setInterval(() => {
      const wasReset = checkAndResetRateLimit();
      if (wasReset) {}
    }, 1000) as unknown as number;
  }
};
const { info: storedRateLimit, exceeded: storedExceeded } = loadRateLimitFromStorage();
let isRateLimitExceeded = storedExceeded;
let currentRateLimit: RateLimitInfo = storedRateLimit || {
  limit: 10,
  remaining: 10,
  reset: 0,
  resetTimeString: '',
  isSearchAPI: true,
  exceeded: false
};
if (isRateLimitExceeded && !currentRateLimit.exceeded) {
  currentRateLimit = {
    ...currentRateLimit,
    exceeded: true,
    remaining: 0
  };
}
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
const updateRateLimitInfo = (updates: Partial<RateLimitInfo>): void => {
  currentRateLimit = {
    ...currentRateLimit,
    ...updates
  };
  if (updates.remaining !== undefined && updates.remaining <= 0) {
    currentRateLimit.exceeded = true;
    isRateLimitExceeded = true;
  }
  saveRateLimitToStorage(currentRateLimit, isRateLimitExceeded);
  rateLimitSubscribers.forEach(callback => {
    callback({ ...currentRateLimit });
  });
};
const isRateLimitError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('rate limit') || 
         lowerMessage.includes('api rate') || 
         lowerMessage.includes('api limit') ||
         lowerMessage.includes('exceeded');
};
export const setRateLimitExceeded = (exceeded: boolean = true): void => {
  isRateLimitExceeded = exceeded;
  if (exceeded) {
    updateRateLimitInfo({
      remaining: 0,
      exceeded: true
    });
  } else {
    saveRateLimitToStorage(currentRateLimit, exceeded);
  }
};
const extractRateLimitInfo = (response: Response): void => {
  const isSearchRequest = response.url.includes('/search/');
  const defaultLimit = isSearchRequest ? 10 : 60;
  const limit = parseInt(response.headers.get('X-RateLimit-Limit') || String(defaultLimit), 10);
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10);
  const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10);
  if (response.headers.has('X-RateLimit-Limit') || response.headers.has('X-RateLimit-Remaining')) {
    const resetDate = new Date(reset * 1000);
    const resetTimeString = resetDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    updateRateLimitInfo({
      limit,
      remaining,
      reset,
      resetTimeString,
      isSearchAPI: isSearchRequest,
      exceeded: remaining <= 0
    });
  } else {
    const newRemaining = Math.max(0, currentRateLimit.remaining - 1);
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
  } catch (error) {}
};
export const searchUsers = async (query: string): Promise<GitHubUserResponse> => {
  if (getIsRateLimitExceeded()) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  try {
    const response = await fetch(`${BASE_URL}/users?q=${encodeURIComponent(query)}`);
    extractRateLimitInfo(response);
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error fetching users: ${response.status}`;
      if (isRateLimitError(errorMessage)) {
        setRateLimitExceeded(true);
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (isRateLimitError(errorMessage)) {
      setRateLimitExceeded(true);
    }
    throw error;
  }
};
export const searchRepos = async (query: string): Promise<GitHubRepoResponse> => {
  if (getIsRateLimitExceeded()) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  try {
    const response = await fetch(`${BASE_URL}/repositories?q=${encodeURIComponent(query)}`);
    extractRateLimitInfo(response);
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error fetching repositories: ${response.status}`;
      if (isRateLimitError(errorMessage)) {
        setRateLimitExceeded(true);
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (isRateLimitError(errorMessage)) {
      setRateLimitExceeded(true);
    }
    throw error;
  }
};
export const transformAndSortResults = (
  users: GitHubUserResponse,
  repos: GitHubRepoResponse
): AutocompleteResultItem[] => {
  const userResults = users.items.map((user) => ({
    id: `user-${user.id}`,
    name: user.login,
    type: 'user' as const,
    url: user.html_url,
    avatarUrl: user.avatar_url,
  }));
  const repoResults = repos.items.map((repo) => ({
    id: `repo-${repo.id}`,
    name: repo.name,
    type: 'repository' as const,
    url: repo.html_url,
    avatarUrl: repo.owner.avatar_url,
    description: repo.description,
  }));
  const combinedResults = [...userResults, ...repoResults];
  return combinedResults
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 50);
};
export const searchGitHub = async (query: string): Promise<AutocompleteResultItem[]> => {
  try {
    if (getIsRateLimitExceeded()) {
      const fallbackResults = getFallbackResults(query);
      if (fallbackResults.length > 0) {
        return fallbackResults;
      }
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    const [usersResponse, reposResponse] = await Promise.all([
      searchUsers(query),
      searchRepos(query),
    ]);
    return transformAndSortResults(usersResponse, reposResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (isRateLimitError(errorMessage)) {
      setRateLimitExceeded(true);
    }
    
    throw error;
  }
};
