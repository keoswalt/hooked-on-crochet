
import React from 'react';

interface LinkRendererProps {
  text: string;
  className?: string;
}

export const LinkRenderer = ({ text, className }: LinkRendererProps) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  const renderTextWithLinks = (text: string) => {
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <span className={className}>
      {renderTextWithLinks(text)}
    </span>
  );
};
