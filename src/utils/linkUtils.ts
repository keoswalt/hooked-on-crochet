
export const detectLinks = (text: string): Array<{ type: 'text' | 'link'; content: string }> => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
  const parts: Array<{ type: 'text' | 'link'; content: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    // Add the link
    let url = match[0];
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = url.startsWith('www.') ? `https://${url}` : `https://${url}`;
    }

    parts.push({
      type: 'link',
      content: match[0]
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return parts;
};
