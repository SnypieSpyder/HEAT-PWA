import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { Page, ContentBlock } from '../../../types';
import { generateSlug, isSlugAvailable, getPages, buildFullSlug } from '../../../services/pages';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import {
  TextBlock,
  ImageBlock,
  GalleryBlock,
  HeroBlock,
  TwoColumnBlock,
} from '../blocks';
import {
  TextBlockRenderer,
  ImageBlockRenderer,
  GalleryBlockRenderer,
  HeroBlockRenderer,
  TwoColumnBlockRenderer,
} from '../../public/blocks';

interface PageBuilderFormProps {
  page?: Page;
  onSubmit: (data: Partial<Page>) => Promise<void>;
  onCancel: () => void;
}

const BLOCK_TYPES = [
  { value: 'text', label: 'Text Block' },
  { value: 'image', label: 'Image Block' },
  { value: 'gallery', label: 'Gallery Block' },
  { value: 'hero', label: 'Hero Section' },
  { value: 'twoColumn', label: 'Two Column Layout' },
] as const;

export const PageBuilderForm: React.FC<PageBuilderFormProps> = ({
  page,
  onSubmit,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [slugError, setSlugError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [parentPages, setParentPages] = useState<Page[]>([]);
  
  const [formData, setFormData] = useState<Partial<Page>>({
    title: '',
    slug: '',
    parentId: undefined,
    category: '',
    tags: [],
    metaDescription: '',
    status: 'draft',
    showInNav: false,
    navOrder: 0,
    blocks: [],
  });

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        parentId: page.parentId,
        category: page.category || '',
        tags: page.tags || [],
        metaDescription: page.metaDescription,
        status: page.status,
        showInNav: page.showInNav,
        navOrder: page.navOrder,
        blocks: page.blocks || [],
      });
    }
  }, [page]);

  // Fetch parent pages on mount
  useEffect(() => {
    const fetchParentPages = async () => {
      try {
        const pages = await getPages();
        // Allow selecting any page except current page (can't be parent of itself)
        setParentPages(pages.filter((p) => p.id !== page?.id));
      } catch (error) {
        console.error('Error fetching parent pages:', error);
      }
    };
    fetchParentPages();
  }, [page?.id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!page && formData.title) {
      const newSlug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
      validateSlug(newSlug);
    }
  }, [formData.title, page]);

  const validateSlug = async (slug: string) => {
    if (!slug) {
      setSlugError('Slug is required');
      return false;
    }

    const available = await isSlugAvailable(slug, page?.id);
    if (!available) {
      setSlugError('This slug is already taken');
      return false;
    }

    setSlugError('');
    return true;
  };

  const handleSlugChange = (slug: string) => {
    const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, slug: sanitizedSlug }));
    validateSlug(sanitizedSlug);
  };

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: formData.blocks?.length || 0,
    };

    setFormData((prev) => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));
  };

  const getDefaultContent = (type: ContentBlock['type']): any => {
    switch (type) {
      case 'text':
        return { text: '', alignment: 'left' as const };
      case 'image':
        return { url: '', caption: '', alt: '' };
      case 'gallery':
        return { images: [] };
      case 'hero':
        return { 
          backgroundUrl: '', 
          title: '', 
          subtitle: '', 
          buttonText: '', 
          buttonLink: '',
          overlayColor: '#000000',
          overlayOpacity: 40
        };
      case 'twoColumn':
        return { leftContent: '', rightContent: '', imagePosition: 'left' as const, imageUrl: '' };
      default:
        return {};
    }
  };

  const removeBlock = (blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks?.filter((b) => b.id !== blockId) || [],
    }));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...(formData.blocks || [])];
    const index = blocks.findIndex((b) => b.id === blockId);

    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

    // Update order values
    blocks.forEach((block, i) => {
      block.order = i;
    });

    setFormData((prev) => ({ ...prev, blocks }));
  };

  const updateBlockContent = (blockId: string, content: any) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks?.map((b) => (b.id === blockId ? { ...b, content } : b)) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.slug) {
      setError('Title and slug are required');
      return;
    }

    if (slugError) {
      setError('Please fix the slug error before submitting');
      return;
    }

    setLoading(true);
    try {
      // Calculate full slug from parent chain
      const fullSlug = await buildFullSlug(formData.slug!, formData.parentId);
      
      // Force showInNav to false for sub-pages
      const submitData = {
        ...formData,
        fullSlug,
        showInNav: formData.parentId ? false : formData.showInNav,
      };
      
      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.message || 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  const renderBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlock
            content={block.content as any}
            onChange={(content) => updateBlockContent(block.id, content)}
          />
        );
      case 'image':
        return (
          <ImageBlock
            content={block.content as any}
            onChange={(content) => updateBlockContent(block.id, content)}
          />
        );
      case 'gallery':
        return (
          <GalleryBlock
            content={block.content as any}
            onChange={(content) => updateBlockContent(block.id, content)}
          />
        );
      case 'hero':
        return (
          <HeroBlock
            content={block.content as any}
            onChange={(content) => updateBlockContent(block.id, content)}
          />
        );
      case 'twoColumn':
        return (
          <TwoColumnBlock
            content={block.content as any}
            onChange={(content) => updateBlockContent(block.id, content)}
          />
        );
      default:
        return null;
    }
  };

  const renderBlockPreview = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return <TextBlockRenderer key={block.id} content={block.content as any} />;
      case 'image':
        return <ImageBlockRenderer key={block.id} content={block.content as any} />;
      case 'gallery':
        return <GalleryBlockRenderer key={block.id} content={block.content as any} />;
      case 'hero':
        return <HeroBlockRenderer key={block.id} content={block.content as any} />;
      case 'twoColumn':
        return <TwoColumnBlockRenderer key={block.id} content={block.content as any} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={page ? 'Edit Page' : 'Create New Page'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert type="error" message={error} />}

        {/* Basic Info Section */}
        <div className="space-y-4 pb-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Page Information</h3>

          <Input
            label="Page Title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., About Us"
          />

          <div>
            <Input
              label="Slug (URL)"
              value={formData.slug || ''}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              placeholder="about-us"
              helperText={`Page will be available at: /pages/${formData.slug || 'your-slug'}`}
            />
            {slugError && <p className="text-sm text-red-600 mt-1">{slugError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Meta Description (SEO)
            </label>
            <textarea
              value={formData.metaDescription || ''}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief description for search engines (recommended 150-160 characters)"
              maxLength={160}
            />
            {formData.metaDescription && (
              <p className="text-xs text-neutral-500 mt-1">
                {formData.metaDescription.length}/160 characters
              </p>
            )}
          </div>

          {/* Parent Page Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Parent Page (Optional)
            </label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">None (Root Page)</option>
              {parentPages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullSlug || p.slug} - {p.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Select a parent to make this a sub-page. Sub-pages will not appear in the navbar.
            </p>
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category (Optional)
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Academic, Sports, Events"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Used for filtering sub-pages
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., dual-enrollment, advanced, 2025"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Used for searching sub-pages
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {!formData.parentId && (
              <div>
                <label className="flex items-center space-x-2 cursor-pointer pt-8">
                  <input
                    type="checkbox"
                    checked={formData.showInNav || false}
                    onChange={(e) => setFormData({ ...formData, showInNav: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    Show in Navigation Menu
                  </span>
                </label>
              </div>
            )}
          </div>

          {formData.showInNav && !formData.parentId && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Navigation Order
              </label>
              <input
                type="number"
                value={formData.navOrder || 0}
                onChange={(e) =>
                  setFormData({ ...formData, navOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Lower numbers appear first in the menu
              </p>
            </div>
          )}
        </div>

        {/* Content Blocks Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-neutral-900">Content Blocks</h3>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span className="ml-1">{showPreview ? 'Hide' : 'Show'} Preview</span>
              </Button>
            </div>
          </div>

          {/* Add Block Buttons */}
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map((type) => (
              <Button
                key={type.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock(type.value as ContentBlock['type'])}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                {type.label}
              </Button>
            ))}
          </div>

          {/* Blocks List - Editor Mode */}
          {!showPreview && (
            <>
              {formData.blocks && formData.blocks.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
                  <p className="text-neutral-500">
                    No content blocks yet. Click a button above to add your first block.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {formData.blocks?.map((block, index) => (
                  <div
                    key={block.id}
                    className="border border-neutral-300 rounded-lg p-4 bg-neutral-50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          {BLOCK_TYPES.find((t) => t.value === block.type)?.label || block.type}
                        </span>
                        <span className="text-sm text-neutral-500">Block {index + 1}</span>
                      </div>

                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ChevronUpIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={index === (formData.blocks?.length || 0) - 1}
                          className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Remove Block"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">{renderBlockEditor(block)}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Preview Mode */}
          {showPreview && (
            <div className="bg-white border-2 border-primary-300 rounded-lg p-8">
              <div className="max-w-5xl mx-auto">
                {/* Preview Header */}
                <div className="mb-8 pb-4 border-b border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded">
                      Preview Mode
                    </span>
                    <span className="text-sm text-neutral-500">
                      This is how visitors will see your page
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 text-center">
                    {formData.title || 'Untitled Page'}
                  </h1>
                </div>

                {/* Preview Content */}
                {formData.blocks && formData.blocks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-500">This page is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {formData.blocks
                      ?.sort((a, b) => a.order - b.order)
                      .map((block) => renderBlockPreview(block))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !!slugError}>
            {loading ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

