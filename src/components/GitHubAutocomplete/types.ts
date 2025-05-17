/**
 * TypeScript interfaces and types for the GitHub Autocomplete component
 */

// GitHub API response interfaces
export interface GitHubUserResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

export interface GitHubRepoResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

// GitHub user interface
export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  type: string;
  score: number;
}

// GitHub repository interface
export interface GitHubRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  };
  html_url: string;
  description: string;
  stargazers_count: number;
}

// Combined result item (either user or repo)
export interface AutocompleteResultItem {
  id: string; // Unique identifier
  name: string; // Display name for sorting and showing
  type: 'user' | 'repository'; // Discriminator
  url: string; // Link to open on click/enter
  avatarUrl: string; // Avatar or icon URL
  description?: string; // Additional info (for repositories)
}

// Props for the main GitHubAutocomplete component
export interface GitHubAutocompleteProps {
  placeholder?: string;
  className?: string;
  debounceTime?: number;
  minChars?: number;
  typingThreshold?: number;
  onSelect?: (item: AutocompleteResultItem) => void;
}

// Props for the SearchInput component
export interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaControls?: string;
  ariaActivedescendant?: string; 
  expanded?: boolean;
  onArrowDown?: () => void;
  onArrowUp?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  className?: string;
}

// Props for the DropdownList component
export interface DropdownListProps {
  id?: string;
  items: AutocompleteResultItem[];
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;
  onSelect: (item: AutocompleteResultItem) => void;
  highlightText: string;
}

// Props for individual result items
export interface ResultItemProps {
  item: AutocompleteResultItem;
  isSelected: boolean;
  onSelect: () => void;
  highlightText: string;
}

// Search state for the component
export interface SearchState {
  query: string;
  results: AutocompleteResultItem[];
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;
  showDropdown: boolean;
}

// Search action types for reducer
export type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_RESULTS'; payload: AutocompleteResultItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_INDEX'; payload: number }
  | { type: 'SET_SHOW_DROPDOWN'; payload: boolean }
  | { type: 'RESET' };

// Cache item structure for storing results
export interface CacheItem {
  timestamp: number;
  results: AutocompleteResultItem[];
}
