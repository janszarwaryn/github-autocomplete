/**
 * SearchInput component
 * Input field for the GitHub autocomplete component
 */
import { forwardRef } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { SearchInputProps } from './types';

/**
 * SearchInput component
 * Provides the input field for searching GitHub
 */
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    id,
    value, 
    onChange, 
    placeholder = 'Search GitHub...', 
    disabled = false, 
    ariaControls, 
    ariaActivedescendant,
    expanded = false,
    onArrowDown,
    onArrowUp,
    onEnter,
    onEscape,
    className = ''
  }, ref) => {
    /**
     * Handle input change
     */
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    };

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          id={id}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            // Obsługa wszystkich klawiszy nawigacji
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault(); // Zapobieganie scrollowaniu strony
                if (onArrowDown) onArrowDown();
                break;
              case 'ArrowUp':
                e.preventDefault(); // Zapobieganie scrollowaniu strony
                if (onArrowUp) onArrowUp();
                break;
              case 'Enter':
                if (expanded && ariaActivedescendant && onEnter) {
                  e.preventDefault();
                  onEnter();
                }
                break;
              case 'Escape':
                if (expanded && onEscape) {
                  e.preventDefault();
                  onEscape();
                }
                break;
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={ariaControls}
          aria-activedescendant={ariaActivedescendant || undefined}
          aria-owns={ariaControls}
          autoComplete="off"
          spellCheck="false"
          className={`w-full px-4 py-3 text-base border rounded-md outline-none transition-all duration-200 ${disabled ? 'bg-github-hover cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-github-blue focus:border-github-blue'} border-github-border ${className}`}
        />
        {disabled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
            <div className="w-4 h-4 border-2 border-github-blue/20 border-t-github-blue rounded-full animate-spin-slow" />
          </div>
        )}
      </div>
    );
  }
);

// Set display name for debugging
SearchInput.displayName = 'SearchInput';

export default SearchInput;
