/**
 * Utility functions for formatting text content
 */
import React from 'react';

/**
 * Converts newline characters in text to HTML line breaks
 * @param text - The text to format
 * @returns JSX element with line breaks preserved
 */
export const formatTextWithLineBreaks = (text: string): React.ReactNode => {
  if (!text) return text;
  
  return text.split('\n').map((line, index, array) => (
    React.createElement('span', { key: index },
      line,
      index < array.length - 1 && React.createElement('br')
    )
  ));
};

/**
 * Alternative approach using CSS white-space preservation
 * @param text - The text to format  
 * @returns The original text with CSS class to preserve whitespace
 */
export const getWhitespacePreserveClass = (): string => {
  return 'whitespace-pre-line';
};

/**
 * Cleans and normalizes text input
 * @param text - The text to clean
 * @returns Cleaned text
 */
export const cleanText = (text: string): string => {
  if (!text) return '';
  return text.trim().replace(/\r\n/g, '\n'); // Normalize line endings
};