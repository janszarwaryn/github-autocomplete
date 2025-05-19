import React, { useEffect, useRef } from 'react';
import type { DropdownListProps } from './types';
import ResultItem from './ResultItem';

const DropdownList: React.FC<DropdownListProps> = ({
  id,
  items,
  isLoading,
  error,
  selectedIndex,
  onSelect,
  highlightText,
}) => {

  const listContainerRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    if (selectedIndex >= 0 && items.length > 0 && !isLoading) {
      const selectedElement = document.getElementById(`github-result-${items[selectedIndex].id}`);
      
      if (selectedElement && listContainerRef.current) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex, items, isLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-github-secondary" data-testid="loading-state">
          <div className="w-6 h-6 border-3 border-github-blue/20 border-t-github-blue rounded-full animate-spin-slow mb-3" aria-hidden="true"></div>
          <span>Searching GitHub...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-github-error bg-github-error-bg" data-testid="error-state">
          <svg className="w-6 h-6 mb-3" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{error}</span>
        </div>
      );
    }
    
    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center py-6 text-github-secondary" data-testid="no-results-state">
          <span>No results found</span>
        </div>
      );
    }
    
    return (
      <ul 
        ref={listContainerRef} 
        className="max-h-[400px] overflow-y-auto" 
        role="listbox" 
        aria-label="GitHub search results">
        {items.map((item, index) => (
          <ResultItem
            key={item.id}
            item={item}
            isSelected={index === selectedIndex}
            onSelect={() => onSelect(item)}
            highlightText={highlightText}
          />
        ))}
      </ul>
    );
  };

  return (
    <div 
      id={id}
      className="absolute top-full left-0 w-full bg-white border border-github-border rounded-md shadow-lg mt-1 z-10" 
      data-testid="dropdown-container"
      tabIndex={-1}
      role="region"
      aria-label="Wyniki wyszukiwania"
    >
      {renderContent()}
    </div>
  );
};

export default DropdownList;
