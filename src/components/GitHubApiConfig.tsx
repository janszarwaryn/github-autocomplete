import React, { useState, useEffect } from 'react';
import { configureGitHubApi } from '../services/githubApi';

// Local storage key for the token
const TOKEN_STORAGE_KEY = 'github_api_token';

interface GitHubApiConfigProps {
  className?: string;
}

const GitHubApiConfig: React.FC<GitHubApiConfigProps> = ({ className = '' }) => {
  const [token, setToken] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [showToken, setShowToken] = useState<boolean>(false);

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      setToken(savedToken);
      configureGitHubApi(savedToken);
      setIsConfigured(true);
    }
  }, []);

  const handleSave = () => {
    const tokenToSave = token.trim();
    if (tokenToSave) {
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenToSave);
      configureGitHubApi(tokenToSave);
      setIsConfigured(true);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    configureGitHubApi(null);
    setToken('');
    setIsConfigured(false);
  };

  return (
    <div className={`text-sm border rounded p-3 mb-4 ${className}`}>
      <h3 className="font-medium mb-2">GitHub API Configuration</h3>
      <p className="text-xs mb-2">
        Configure a GitHub personal token to increase rate limits from 10 to 30 requests per minute.
        <a 
          href="https://github.com/settings/tokens" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 ml-1 hover:underline"
        >
          Create a token
        </a>
      </p>
      
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <input
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="GitHub personal token"
            className="w-full p-1 border rounded text-sm"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500"
          >
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
        
        <button
          onClick={handleSave}
          disabled={!token.trim()}
          className={`px-3 py-1 rounded text-xs ${
            !token.trim() 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Save
        </button>
        
        {isConfigured && (
          <button
            onClick={handleClear}
            className="px-3 py-1 rounded text-xs bg-red-500 hover:bg-red-600 text-white"
          >
            Clear
          </button>
        )}
      </div>
      
      {isConfigured && (
        <div className="mt-2 text-xs text-green-600">
          ✓ GitHub API token configured. Rate limit increased to 30 requests/minute.
        </div>
      )}
    </div>
  );
};

export default GitHubApiConfig;
