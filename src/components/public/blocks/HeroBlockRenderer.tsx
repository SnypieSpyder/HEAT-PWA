import React from 'react';
import { Link } from 'react-router-dom';
import { HeroBlockContent } from '../../../types';
import { sanitizeUrl } from '../../../utils/security';

interface HeroBlockRendererProps {
  content: HeroBlockContent;
}

export const HeroBlockRenderer: React.FC<HeroBlockRendererProps> = ({ content }) => {
  // SECURITY: Sanitize URL to prevent javascript: injection
  const safeButtonLink = sanitizeUrl(content.buttonLink);
  const isExternalLink = safeButtonLink.startsWith('http');
  
  // Get overlay color and opacity with defaults
  const overlayColor = content.overlayColor || '#000000';
  const overlayOpacity = (content.overlayOpacity ?? 40) / 100;

  return (
    <div className="relative h-96 md:h-[500px] my-8 rounded-lg overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${content.backgroundUrl})` }}
      >
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundColor: overlayColor,
            opacity: overlayOpacity
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-lg">
              {content.subtitle}
            </p>
          )}
          {content.buttonText && safeButtonLink && (
            isExternalLink ? (
              <a
                href={safeButtonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
              >
                {content.buttonText}
              </a>
            ) : (
              <Link
                to={safeButtonLink}
                className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
              >
                {content.buttonText}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

