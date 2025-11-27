import React, { useState } from 'react';
import { HeroBlockContent } from '../../../types';
import { ImageUpload } from '../common/ImageUpload';
import { sanitizeUrl } from '../../../utils/security';

interface HeroBlockProps {
  content: HeroBlockContent;
  onChange: (content: HeroBlockContent) => void;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({ content, onChange }) => {
  const [urlWarning, setUrlWarning] = useState('');
  return (
    <div className="space-y-4">
      <div>
        <ImageUpload
          label="Background Image"
          value={content.backgroundUrl}
          onChange={(url) => onChange({ ...content, backgroundUrl: url })}
          folder="pages/hero"
        />
      </div>

      {/* Overlay Customization */}
      <div className="p-4 bg-neutral-50 rounded-lg space-y-4">
        <h4 className="text-sm font-semibold text-neutral-700">Overlay Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Overlay Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={content.overlayColor || '#000000'}
                onChange={(e) => onChange({ ...content, overlayColor: e.target.value })}
                className="h-10 w-20 rounded border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={content.overlayColor || '#000000'}
                onChange={(e) => onChange({ ...content, overlayColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Color of the overlay on the background image
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Overlay Opacity: {content.overlayOpacity ?? 40}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={content.overlayOpacity ?? 40}
              onChange={(e) => onChange({ ...content, overlayOpacity: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Transparent</span>
              <span>Opaque</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-2">
          <p className="text-xs text-neutral-600 mb-2">Preview:</p>
          <div className="h-16 rounded-lg flex items-center justify-center relative overflow-hidden border border-neutral-200">
            {/* Background - use actual image if available, otherwise white with subtle pattern */}
            {content.backgroundUrl ? (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${content.backgroundUrl})` }}
              />
            ) : (
              <div 
                className="absolute inset-0 bg-white"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.02) 10px, rgba(0,0,0,.02) 20px)'
                }}
              />
            )}
            {/* Overlay with custom color and opacity */}
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundColor: content.overlayColor || '#000000',
                opacity: (content.overlayOpacity ?? 40) / 100
              }}
            />
            <p 
              className="relative font-semibold text-sm drop-shadow-lg"
              style={{
                color: (content.overlayOpacity ?? 40) < 30 ? '#1f2937' : '#ffffff'
              }}
            >
              Sample Text
            </p>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {content.backgroundUrl 
              ? 'Showing your uploaded background with overlay' 
              : 'Upload a background image to see actual preview'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Hero title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Subtitle (optional)
        </label>
        <textarea
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Hero subtitle or description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Button Text (optional)
          </label>
          <input
            type="text"
            value={content.buttonText || ''}
            onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Learn More"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Button Link (optional)
          </label>
          <input
            type="text"
            value={content.buttonLink || ''}
            onChange={(e) => {
              const url = e.target.value;
              const sanitized = sanitizeUrl(url);
              
              if (url && !sanitized) {
                setUrlWarning('⚠️ Only http://, https://, and relative paths (/) are allowed');
              } else {
                setUrlWarning('');
              }
              
              onChange({ ...content, buttonLink: url });
            }}
            onBlur={(e) => {
              // Sanitize on blur to clean up invalid URLs
              const url = e.target.value;
              const sanitized = sanitizeUrl(url);
              if (url && !sanitized) {
                onChange({ ...content, buttonLink: '' });
                setUrlWarning('Invalid URL cleared. Use http://, https://, or /path');
              }
            }}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="/classes or https://example.com"
          />
          {urlWarning && (
            <p className="text-sm text-red-600 mt-1">{urlWarning}</p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            Use relative paths (e.g., /classes) or full URLs (e.g., https://example.com)
          </p>
        </div>
      </div>

      {content.buttonText && !content.buttonLink && (
        <p className="text-sm text-amber-600">
          Note: Button text is set but no link is provided. The button will not be displayed.
        </p>
      )}
    </div>
  );
};

