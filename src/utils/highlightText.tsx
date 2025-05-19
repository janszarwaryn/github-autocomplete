import React from 'react';


export const highlightText = (
  text: string,
  query: string
): React.ReactNode => {
  if (!query.trim()) {
    return text;
  }

  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    const parts = text.split(regex);
    
    if (parts.length <= 1) {
      return text;
    }
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <strong key={index} className="highlighted-text">{part}</strong>;
      }
      return part;
    });
  } catch (error) {
    console.warn('Error highlighting text:', error);
    return text;
  }
};
