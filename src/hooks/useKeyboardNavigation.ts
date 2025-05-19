import { useCallback, useEffect } from 'react';
import type { AutocompleteResultItem } from '../components/GitHubAutocomplete/types';

interface UseKeyboardNavigationProps {
  isOpen: boolean;
  results: AutocompleteResultItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onSelect: (item: AutocompleteResultItem) => void;
  closeDropdown?: () => void;
}


export function useKeyboardNavigation({
  isOpen,
  results,
  selectedIndex,
  setSelectedIndex,
  onSelect,
  closeDropdown,
}: UseKeyboardNavigationProps) {

  const handleArrowDown = useCallback(() => {
    if (!isOpen || results.length === 0) return;
    

    const newIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
  }, [isOpen, results.length, setSelectedIndex]);


  const handleArrowUp = useCallback(() => {
    if (!isOpen || results.length === 0) return;
    

    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
    setSelectedIndex(newIndex);
  }, [isOpen, results.length, setSelectedIndex]);


  const handleEnter = useCallback(() => {
    if (!isOpen || results.length === 0 || selectedIndex === -1) return;
    

    onSelect(results[selectedIndex]);
  }, [isOpen, onSelect, results, selectedIndex]);


  const handleEscape = useCallback(() => {
    if (!isOpen) return;
    
    if (closeDropdown) {
      closeDropdown();
    }
  }, [isOpen, closeDropdown]);
  

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {

      const activeElement = document.activeElement;
      const isSearchInput = 
        activeElement && 
        (activeElement.id === 'github-search-input' || 
         activeElement.tagName === 'SEARCH' || 
         activeElement.tagName === 'FORM' && activeElement.getAttribute('role') === 'search');


      if ((!isOpen && !['ArrowDown', 'ArrowUp'].includes(event.key)) || !isSearchInput) {
        return;
      }
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          handleArrowDown();
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleArrowUp();
          break;
        case 'Enter':
          if (isOpen && selectedIndex >= 0) {
            event.preventDefault();
            handleEnter();
          }
          break;
        case 'Escape':
          event.preventDefault();
          handleEscape();
          break;
        default:
          break;
      }
    };


    document.addEventListener('keydown', handleKeyDown);
    

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleArrowDown, handleArrowUp, handleEnter, handleEscape, isOpen, selectedIndex]);


  return {
    handleArrowDown,
    handleArrowUp,
    handleEnter
  };
}
