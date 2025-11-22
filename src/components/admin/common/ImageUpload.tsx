import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { uploadFile } from '../../../services/storage';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = 'images',
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value prop changes (for editing existing items)
  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const url = await uploadFile(folder, file);
      onChange(url);
    } catch (err) {
      setError('Failed to upload image');
      console.error('Upload error:', err);
      setPreviewUrl(value);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-neutral-700">{label}</label>}
      
      <div className="flex items-start space-x-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border-2 border-neutral-200"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              type="button"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="h-32 w-32 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center bg-neutral-50">
            <PhotoIcon className="h-12 w-12 text-neutral-400" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <PhotoIcon className="h-5 w-5 mr-2" />
                {previewUrl ? 'Change Image' : 'Select Image'}
              </>
            )}
          </Button>

          <p className="text-xs text-neutral-500">
            PNG, JPG, GIF up to {maxSizeMB}MB
          </p>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

