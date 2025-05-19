
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


export interface AutocompleteResultItem {
  id: string;
  name: string;
  type: 'user' | 'repository';
  url: string;
  avatarUrl: string;
  description?: string;
}


export interface GitHubAutocompleteProps {
  placeholder?: string;
  className?: string;
  debounceTime?: number;
  minChars?: number;
  typingThreshold?: number;
  onSelect?: (item: AutocompleteResultItem) => void;
}


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


export interface DropdownListProps {
  id?: string;
  items: AutocompleteResultItem[];
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;
  onSelect: (item: AutocompleteResultItem) => void;
  highlightText: string;
}


export interface ResultItemProps {
  item: AutocompleteResultItem;
  isSelected: boolean;
  onSelect: () => void;
  highlightText: string;
}


export interface SearchState {
  query: string;
  results: AutocompleteResultItem[];
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;
  showDropdown: boolean;
}


export type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_RESULTS'; payload: AutocompleteResultItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_INDEX'; payload: number }
  | { type: 'SET_SHOW_DROPDOWN'; payload: boolean }
  | { type: 'RESET' };


export interface CacheItem {
  timestamp: number;
  results: AutocompleteResultItem[];
}
