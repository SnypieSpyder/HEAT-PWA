import React from 'react';
import { ImageBlockContent } from '../../../types';

interface ImageBlockRendererProps {
  content: ImageBlockContent;
}

export const ImageBlockRenderer: React.FC<ImageBlockRendererProps> = ({ content }) => {
  if (!content.url) return null;

  return (
    <figure className="my-8">
      <img
        src={content.url}
        alt={content.alt || content.caption || 'Image'}
        className="w-full h-auto rounded-lg shadow-lg"
      />
      {content.caption && (
        <figcaption className="text-center text-sm text-neutral-600 mt-3">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
};

