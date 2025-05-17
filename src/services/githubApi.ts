
import type { GitHubUserResponse, GitHubRepoResponse, AutocompleteResultItem } from '../components/GitHubAutocomplete/types';
import { getFallbackResults } from '../utils/cacheUtils';
import { 
  getIsRateLimitExceeded, 
  extractRateLimitInfo, 
  isRateLimitError, 
  setRateLimitExceeded,
  updateRateLimitInfo
} from './rateLimitService';


const BASE_URL = 'https://api.github.com/search';


let authToken: string | null = null;


export const configureGitHubApi = (token: string | null): void => {
  authToken = token;
  updateRateLimitInfo({
    limit: token ? 30 : 10,
    remaining: token ? 30 : 10
  });
  
  console.log(`GitHub API configured with token: ${token ? 'YES' : 'NO'}, rate limit: ${token ? '30' : '10'} requests/minute`);
};


const createHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (authToken) {
    headers['Authorization'] = `token ${authToken}`;
  }
  
  return headers;
};


export const searchUsers = async (query: string): Promise<GitHubUserResponse> => {
  if (getIsRateLimitExceeded()) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/users?q=${encodeURIComponent(query)}`, 
      { headers: createHeaders() }
    );
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

/**
 * Search GitHub repositories by query
 * @param query Search query string
 * @returns Promise with repository response data
 */
export const searchRepos = async (query: string): Promise<GitHubRepoResponse> => {
  if (getIsRateLimitExceeded()) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/repositories?q=${encodeURIComponent(query)}`,
      { headers: createHeaders() }
    );
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


const createRepoResults = (repos: GitHubRepoResponse): AutocompleteResultItem[] => {
  return repos.items.map((repo) => ({
    id: `repo-${repo.id}`,
    name: repo.name,
    type: 'repository' as const,
    url: repo.html_url,
    avatarUrl: repo.owner.avatar_url,
    description: repo.description,
  }));
};


interface RepoOwner {
  id: number;
  login: string;
  html_url: string;
  avatar_url: string;
}


export const searchGitHub = async (query: string): Promise<AutocompleteResultItem[]> => {
  try {

    if (getIsRateLimitExceeded()) {
      const fallbackResults = getFallbackResults(query);
      if (fallbackResults.length > 0) {
        return fallbackResults;
      }
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    

    const repoQuery = `${query} in:name,description type:repository`;
    
    if (getIsRateLimitExceeded()) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    
    try {
      const response = await fetch(
        `${BASE_URL}/repositories?q=${encodeURIComponent(repoQuery)}&per_page=50`,
        { headers: createHeaders() }
      );
      
      extractRateLimitInfo(response);
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || `Error fetching search results: ${response.status}`;
        
        if (isRateLimitError(errorMessage)) {
          setRateLimitExceeded(true);
        }
        
        throw new Error(errorMessage);
      }
      
      const reposResponse = await response.json();
      

      const repoResults = createRepoResults(reposResponse);
      

      const ownerMap = new Map<string, AutocompleteResultItem>();
      

      reposResponse.items.forEach((repo: any) => {
        if (repo.owner && !ownerMap.has(repo.owner.login)) {
          const owner: RepoOwner = repo.owner;
          ownerMap.set(owner.login, {
            id: `user-${owner.id}`,
            name: owner.login,
            type: 'user' as const,
            url: owner.html_url,
            avatarUrl: owner.avatar_url
          });
        }
      });
      

      const userResults = Array.from(ownerMap.values());
      

      const combinedResults = [...repoResults, ...userResults];
      return combinedResults
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 50);
    } catch (error) {

      const fallbackResults = getFallbackResults(query);
      if (fallbackResults.length > 0) {
        return fallbackResults;
      }
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (isRateLimitError(errorMessage)) {
      setRateLimitExceeded(true);
    }
    
    throw error;
  }
};
