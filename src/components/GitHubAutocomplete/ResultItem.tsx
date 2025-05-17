/**
 * ResultItem component
 * Renders an individual result item in the dropdown list
 */
import React from 'react';
import type { ResultItemProps } from './types';
import { highlightText } from '../../utils/highlightText';

/**
 * ResultItem component
 * Displays a single GitHub search result (user or repository)
 */
const ResultItem: React.FC<ResultItemProps> = ({
  item,
  isSelected,
  onSelect,
  highlightText: query,
}) => {
  // Type-specific icon element
  const iconElement = item.type === 'user' ? (
    <svg className="w-5 h-5 flex-shrink-0 mr-3 text-github-secondary" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14a6 6 0 01-3.81-1.36C4.57 11.46 6.17 11 8 11c1.82 0 3.43.46 3.81 1.64A6 6 0 018 14zm0-8a2 2 0 100 4 2 2 0 000-4zm0 6a4 4 0 110-8 4 4 0 010 8z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 flex-shrink-0 mr-3 text-github-blue" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-11h-8a1 1 0 00-1 1v11a1 1 0 001 1h1.75a.75.75 0 110 1.5h-2.5a.75.75 0 01-.75-.75V3.5a2.5 2.5 0 01.75-1z" />
      <path d="M5 3.75A.75.75 0 015.75 3h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 015 3.75zm0 2.5A.75.75 0 015.75 6h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 015 6.25zm0 2.5A.75.75 0 015.75 9h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 015 9.75z" />
    </svg>
  );

  return (
    <li
      id={`github-result-${item.id}`}
      className={`py-3 px-4 cursor-pointer border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-github-hover' : 'hover:bg-github-hover'} transition-colors duration-150`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      data-testid={`result-item-${item.id}`}
    >
      <div className="flex items-start">
        {iconElement}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-github-text mb-1 break-all">
            {highlightText(item.name, query)}
          </div>
          {item.type === 'repository' && item.description && (
            <div className="text-sm text-github-secondary mb-1 overflow-hidden text-ellipsis line-clamp-2">
              {item.description.length > 100
                ? `${item.description.slice(0, 100)}...`
                : item.description}
            </div>
          )}
          <div className="inline-flex text-xs py-0.5 px-2 bg-github-hover rounded-full text-github-secondary">
            {item.type === 'user' ? 'User' : 'Repository'}
          </div>
        </div>
      </div>
    </li>
  );
};

export default ResultItem;
