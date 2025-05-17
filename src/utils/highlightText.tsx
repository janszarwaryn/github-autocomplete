/**
 * Text highlighting utility
 * Highlights portions of text that match a search query
 */
import React from 'react';

/**
 * Highlights portions of text that match the search query
 * 
 * @param text Original text to highlight within
 * @param query Query string to highlight
 * @returns React elements with highlighted portions
 */
export const highlightText = (
  text: string,
  query: string
): React.ReactNode => {
  if (!query.trim()) {
    return text;
  }

  try {
    // Create a case-insensitive regular expression from the query
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    // Split the text by the regex to get parts
    const parts = text.split(regex);
    
    if (parts.length <= 1) {
      return text;
    }
    
    // Map parts to either plain text or highlighted spans
    return parts.map((part, index) => {
      // Check if this part matches the query (case-insensitive)
      if (part.toLowerCase() === query.toLowerCase()) {
        return <strong key={index} className="highlighted-text">{part}</strong>;
      }
      return part;
    });
  } catch (error) {
    // In case of regex error, return the original text
    console.warn('Error highlighting text:', error);
    return text;
  }
};
