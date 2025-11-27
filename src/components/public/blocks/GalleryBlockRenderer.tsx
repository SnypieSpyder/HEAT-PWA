import React from 'react';
import { GalleryBlockContent } from '../../../types';

interface GalleryBlockRendererProps {
  content: GalleryBlockContent;
}

export const GalleryBlockRenderer: React.FC<GalleryBlockRendererProps> = ({ content }) => {
  if (!content.images || content.images.length === 0) return null;

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.images.map((image, index) => (
          <figure key={index} className="group">
            <div className="overflow-hidden rounded-lg shadow-md">
              <img
                src={image.url}
                alt={image.alt || image.caption || `Gallery image ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {image.caption && (
              <figcaption className="text-center text-sm text-neutral-600 mt-2">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
};

