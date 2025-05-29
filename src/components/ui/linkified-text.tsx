
import React from 'react';
import { detectLinks } from '@/utils/linkUtils';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export const LinkifiedText = ({ text, className = '' }: LinkifiedTextProps) => {
  const parts = detectLinks(text);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          let url = part.content;
          // Add protocol if missing
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = url.startsWith('www.') ? `https://${url}` : `https://${url}`;
          }

          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {part.content}
            </a>
          );
        }
        
        // Preserve line breaks in text content
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part.content}
          </span>
        );
      })}
    </div>
  );
};
