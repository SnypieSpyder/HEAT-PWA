import React from 'react';
import { TextBlockContent } from '../../../types';

interface TextBlockRendererProps {
  content: TextBlockContent;
}

export const TextBlockRenderer: React.FC<TextBlockRendererProps> = ({ content }) => {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[content.alignment || 'left'];

  return (
    <div className={`prose prose-lg max-w-none ${alignmentClass}`}>
      {content.text.split('\n').map((paragraph, index) => (
        paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
      ))}
    </div>
  );
};

