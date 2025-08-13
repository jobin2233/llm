import React from 'react';

/**
 * Text formatting utilities for chat messages
 * Handles markdown-style formatting for better display
 */

/**
 * Converts markdown-style bold text (**text**) to JSX elements
 * @param {string} text - Text containing markdown formatting
 * @returns {Array} - Array of JSX elements and strings
 */
export const formatBoldText = (text) => {
  if (!text || typeof text !== 'string') {
    return [text];
  }

  // Split text by bold markers while keeping the markers
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is bold (wrapped in **)
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and make it bold
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-gray-900">
          {boldText}
        </strong>
      );
    }
    
    // Regular text
    return part;
  });
};

/**
 * Formats dermatological diagnostic response with proper styling
 * @param {string} text - Response text from AI
 * @returns {Array} - Array of JSX elements
 */
export const formatDermatologyResponse = (text) => {
  if (!text || typeof text !== 'string') {
    return [text];
  }

  // Split by lines to handle each line separately
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    if (!line.trim()) {
      return <br key={lineIndex} />;
    }

    // Format bold text in each line
    const formattedLine = formatBoldText(line);
    
    return (
      <div key={lineIndex} className="mb-1">
        {formattedLine}
      </div>
    );
  });
};

/**
 * Simple text formatter that preserves line breaks and formats bold text
 * @param {string} text - Text to format
 * @returns {JSX.Element} - Formatted JSX
 */
export const formatChatMessage = (text) => {
  if (!text || typeof text !== 'string') {
    return <span>{text}</span>;
  }

  return (
    <div className="whitespace-pre-wrap">
      {formatDermatologyResponse(text)}
    </div>
  );
};
