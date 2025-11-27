import React from 'react';
import { TwoColumnBlockContent } from '../../../types';

interface TwoColumnBlockRendererProps {
  content: TwoColumnBlockContent;
}

export const TwoColumnBlockRenderer: React.FC<TwoColumnBlockRendererProps> = ({ content }) => {
  const hasImage = !!content.imageUrl;
  const imageOnLeft = content.imagePosition === 'left';

  const renderTextColumn = (text: string) => (
    <div className="prose prose-lg">
      {text.split('\n').map((paragraph, index) => (
        paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
      ))}
    </div>
  );

  const renderImageColumn = () => (
    <div className="flex items-center justify-center">
      <img
        src={content.imageUrl}
        alt="Column image"
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {hasImage ? (
          <>
            {imageOnLeft ? (
              <>
                <div className="order-1">{renderImageColumn()}</div>
                <div className="order-2">{renderTextColumn(content.rightContent)}</div>
              </>
            ) : (
              <>
                <div className="order-2 md:order-1">{renderTextColumn(content.leftContent)}</div>
                <div className="order-1 md:order-2">{renderImageColumn()}</div>
              </>
            )}
          </>
        ) : (
          <>
            <div>{renderTextColumn(content.leftContent)}</div>
            <div>{renderTextColumn(content.rightContent)}</div>
          </>
        )}
      </div>
    </div>
  );
};

