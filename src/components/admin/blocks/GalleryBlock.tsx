import React from 'react';
import { GalleryBlockContent } from '../../../types';
import { ImageUpload } from '../common/ImageUpload';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';

interface GalleryBlockProps {
  content: GalleryBlockContent;
  onChange: (content: GalleryBlockContent) => void;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ content, onChange }) => {
  const images = content.images || [];

  const addImage = () => {
    onChange({
      images: [...images, { url: '', caption: '', alt: '' }],
    });
  };

  const removeImage = (index: number) => {
    onChange({
      images: images.filter((_, i) => i !== index),
    });
  };

  const updateImage = (index: number, field: 'url' | 'caption' | 'alt', value: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    onChange({ images: updatedImages });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-neutral-700">
          Gallery Images ({images.length})
        </label>
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          Add Image
        </Button>
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500">No images yet. Click "Add Image" to get started.</p>
        </div>
      )}

      <div className="space-y-6">
        {images.map((image, index) => (
          <div key={index} className="border border-neutral-300 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-neutral-900">Image {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="text-red-600 hover:text-red-800"
                title="Remove Image"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <ImageUpload
              label={`Image ${index + 1}`}
              value={image.url}
              onChange={(url) => updateImage(index, 'url', url)}
              folder="pages/gallery"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Caption (optional)
              </label>
              <input
                type="text"
                value={image.caption || ''}
                onChange={(e) => updateImage(index, 'caption', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Image caption"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={image.alt || ''}
                onChange={(e) => updateImage(index, 'alt', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the image"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

