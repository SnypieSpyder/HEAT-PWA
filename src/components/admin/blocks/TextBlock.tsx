import React from 'react';
import { TextBlockContent } from '../../../types';

interface TextBlockProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Text Content
        </label>
        <textarea
          value={content.text || ''}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          rows={8}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your text content here. You can use line breaks for paragraphs."
        />
        <p className="text-xs text-neutral-500 mt-1">
          Tip: Use line breaks to create paragraphs
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Text Alignment
        </label>
        <div className="flex space-x-2">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onChange({ ...content, alignment: align as 'left' | 'center' | 'right' })}
              className={`px-4 py-2 border rounded-lg capitalize transition-colors ${
                content.alignment === align || (!content.alignment && align === 'left')
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

