import React from 'react';
import { TwoColumnBlockContent } from '../../../types';
import { ImageUpload } from '../common/ImageUpload';

interface TwoColumnBlockProps {
  content: TwoColumnBlockContent;
  onChange: (content: TwoColumnBlockContent) => void;
}

export const TwoColumnBlock: React.FC<TwoColumnBlockProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Layout
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onChange({ ...content, imagePosition: 'left' })}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              content.imagePosition === 'left' || !content.imagePosition
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-neutral-300 hover:border-neutral-400'
            }`}
          >
            Image Left
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...content, imagePosition: 'right' })}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              content.imagePosition === 'right'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-neutral-300 hover:border-neutral-400'
            }`}
          >
            Image Right
          </button>
        </div>
      </div>

      <div>
        <ImageUpload
          label="Image (optional)"
          value={content.imageUrl || ''}
          onChange={(url) => onChange({ ...content, imageUrl: url })}
          folder="pages/two-column"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Left Column Content
        </label>
        <textarea
          value={content.leftContent || ''}
          onChange={(e) => onChange({ ...content, leftContent: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Content for the left column"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Right Column Content
        </label>
        <textarea
          value={content.rightContent || ''}
          onChange={(e) => onChange({ ...content, rightContent: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Content for the right column"
        />
      </div>

      <p className="text-xs text-neutral-500">
        Note: If an image is provided, it will replace the content of the column on the selected side.
      </p>
    </div>
  );
};

