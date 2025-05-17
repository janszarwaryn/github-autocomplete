/**
 * useKeyboardNavigation hook
 * Handles keyboard navigation for the autocomplete dropdown
 */
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

/**
 * Hook to handle keyboard navigation in dropdown
 * 
 * @param props Keyboard navigation props
 * @returns Object with navigation handlers
 */
export function useKeyboardNavigation({
  isOpen,
  results,
  selectedIndex,
  setSelectedIndex,
  onSelect,
  closeDropdown,
}: UseKeyboardNavigationProps) {
  /**
   * Handle ArrowDown key press
   */
  const handleArrowDown = useCallback(() => {
    if (!isOpen || results.length === 0) return;
    
    // Move to next item or wrap around to first
    const newIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
  }, [isOpen, results.length, setSelectedIndex]);

  /**
   * Handle ArrowUp key press
   */
  const handleArrowUp = useCallback(() => {
    if (!isOpen || results.length === 0) return;
    
    // Move to previous item or wrap around to last
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
    setSelectedIndex(newIndex);
  }, [isOpen, results.length, setSelectedIndex]);

  /**
   * Handle Enter key press
   */
  const handleEnter = useCallback(() => {
    if (!isOpen || results.length === 0 || selectedIndex === -1) return;
    
    // Select the currently highlighted item
    onSelect(results[selectedIndex]);
  }, [isOpen, onSelect, results, selectedIndex]);

  /**
   * Handle Escape key press
   */
  const handleEscape = useCallback(() => {
    if (!isOpen) return;
    
    if (closeDropdown) {
      closeDropdown();
    }
  }, [isOpen, closeDropdown]);
  
  /**
   * Set up global keyboard event listener 
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Sprawdzanie czy aktywny element jest input-em lub jego przodkiem (formem)
      const activeElement = document.activeElement;
      const isSearchInput = 
        activeElement && 
        (activeElement.id === 'github-search-input' || 
         activeElement.tagName === 'SEARCH' || 
         activeElement.tagName === 'FORM' && activeElement.getAttribute('role') === 'search');

      // Tylko przetwarzaj zdarzenia jeśli dropdown jest otwarty lub klawisze otwierające
      // oraz jeśli focus jest na elemencie wyszukiwania
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

    // Dodanie nasłuchiwania zdarzeń globalnie, ale tylko reagowanie gdy focus jest na inputie
    document.addEventListener('keydown', handleKeyDown);
    
    // Czyszczenie
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
