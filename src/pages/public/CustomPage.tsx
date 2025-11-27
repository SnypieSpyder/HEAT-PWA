import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getPageByFullSlug } from '../../services/pages';
import { Page, ContentBlock } from '../../types';
import { Spinner } from '../../components/ui';
import {
  TextBlockRenderer,
  ImageBlockRenderer,
  GalleryBlockRenderer,
  HeroBlockRenderer,
  TwoColumnBlockRenderer,
} from '../../components/public/blocks';
import { SubPageListing } from '../../components/public/SubPageListing';

export const CustomPage: React.FC = () => {
  const { '*': fullSlugPath } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!fullSlugPath) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getPageByFullSlug(fullSlugPath);

        if (!data) {
          setNotFound(true);
        } else if (data.status !== 'published') {
          // Only show published pages to public
          setNotFound(true);
        } else {
          setPage(data);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [fullSlugPath]);

  // Update document title - MUST be called before any conditional returns
  useEffect(() => {
    if (page) {
      document.title = `${page.title} | Tampa Bay HEAT`;
      if (page.metaDescription) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', page.metaDescription);
        }
      }
    }
  }, [page]);

  const renderBlock = (block: ContentBlock) => {
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

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-5xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-8 text-center">
          {page.title}
        </h1>

        {/* Page Blocks */}
        <div className="space-y-8">
          {page.blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => renderBlock(block))}
        </div>

        {/* Empty State */}
        {(!page.blocks || page.blocks.length === 0) && (
          <div className="text-center py-12">
            <p className="text-neutral-500">This page is currently empty.</p>
          </div>
        )}

        {/* Sub-Page Listing (if page has children) */}
        <SubPageListing parentId={page.id} />
      </div>
    </div>
  );
};

