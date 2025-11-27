import React from 'react';
import { ImageBlockContent } from '../../../types';
import { ImageUpload } from '../common/ImageUpload';

interface ImageBlockProps {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <ImageUpload
          label="Image"
          value={content.url}
          onChange={(url) => onChange({ ...content, url })}
          folder="pages"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Caption (optional)
        </label>
        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Image caption"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Alt Text (for accessibility)
        </label>
        <input
          type="text"
          value={content.alt || ''}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe the image"
        />
      </div>
    </div>
  );
};

