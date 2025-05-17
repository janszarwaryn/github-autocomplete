import React, { useRef, useCallback, useEffect } from 'react';
import type { GitHubAutocompleteProps, AutocompleteResultItem } from './types';
import SearchInput from './SearchInput';
import DropdownList from './DropdownList';
import RateLimitIndicator from './RateLimitIndicator';
import { useGitHubSearch } from '../../hooks/useGitHubSearch';

const GitHubAutocomplete: React.FC<GitHubAutocompleteProps> = ({
  placeholder,
  className = '',
  debounceTime = 500,
  onSelect: externalOnSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    results,
    isLoading,
    error,
    selectedIndex,
    showDropdown,
    handleInputChange,
    setSelectedIndex,
    setShowDropdown,
  } = useGitHubSearch({ debounceTime });

  const handleSelect = useCallback((item: AutocompleteResultItem) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
    if (externalOnSelect) {
      externalOnSelect(item);
    }
    inputRef.current?.focus();
  }, [externalOnSelect]);

  const handleArrowDown = useCallback(() => {
    if (showDropdown && results.length > 0) {
      const newIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(newIndex);
    } else if (results.length > 0) {
      setShowDropdown(true);
    }
  }, [showDropdown, results, selectedIndex, setSelectedIndex, setShowDropdown]);

  const handleArrowUp = useCallback(() => {
    if (showDropdown && results.length > 0) {
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
      setSelectedIndex(newIndex);
    } else if (results.length > 0) {
      setShowDropdown(true);
    }
  }, [showDropdown, results, selectedIndex, setSelectedIndex, setShowDropdown]);

  const handleEnterKey = useCallback(() => {
    if (showDropdown && selectedIndex >= 0 && results.length > 0) {
      handleSelect(results[selectedIndex]);
    }
  }, [showDropdown, selectedIndex, results, handleSelect]);

  const handleEscapeKey = useCallback(() => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  }, [showDropdown, setShowDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowDropdown]);

  const searchResultsId = "github-search-results";
  const activeDescendant = selectedIndex >= 0 && results.length > 0 ? `github-result-${results[selectedIndex].id}` : "";

  return (
    <search className={`relative w-full max-w-[500px] mx-auto ${className}`} ref={containerRef} data-testid="github-autocomplete">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="w-full">
        <label id="search-label" htmlFor="github-search-input" className="sr-only">Wyszukaj użytkowników i repozytoria GitHub</label>
        <div className="relative">
          <SearchInput
            id="github-search-input"
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            ariaControls={searchResultsId}
            ariaActivedescendant={activeDescendant}
            expanded={showDropdown}
            onArrowDown={handleArrowDown}
            onArrowUp={handleArrowUp}
            onEnter={handleEnterKey}
            onEscape={handleEscapeKey}
            className={isLoading ? 'pl-10' : ''}
          />
          {isLoading && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2" aria-hidden="true">
              <div className="w-4 h-4 border-2 border-github-blue/20 border-t-github-blue rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="sr-only" aria-live="polite">
          {isLoading && "Wyszukiwanie..."}
          {!isLoading && error && `Błąd: ${error}`}
          {!isLoading && !error && results.length > 0 && `Znaleziono ${results.length} wyników wyszukiwania.`}
          {!isLoading && !error && results.length === 0 && query.length >= 3 && "Nie znaleziono wyników wyszukiwania."}
        </div>
      </form>
      {showDropdown && (
        <DropdownList
          id={searchResultsId}
          items={results}
          isLoading={isLoading}
          error={error}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          highlightText={query}
        />
      )}
      <RateLimitIndicator className="text-center" />
    </search>
  );
};

export default GitHubAutocomplete;
