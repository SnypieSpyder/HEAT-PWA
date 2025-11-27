import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../types';
import { searchSubPages } from '../../services/pages';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface SubPageListingProps {
  parentId: string;
}

export const SubPageListing: React.FC<SubPageListingProps> = ({ parentId }) => {
  const [subPages, setSubPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Extract unique categories and tags
  const categories = Array.from(new Set(subPages.map((p) => p.category).filter(Boolean)));
  const allTags = Array.from(new Set(subPages.flatMap((p) => p.tags || [])));

  useEffect(() => {
    const fetchSubPages = async () => {
      try {
        setLoading(true);
        const pages = await searchSubPages(parentId);
        setSubPages(pages);
        setFilteredPages(pages);
      } catch (error) {
        console.error('Error fetching sub-pages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubPages();
  }, [parentId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...subPages];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.metaDescription?.toLowerCase().includes(lower)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((p) => p.tags && p.tags.some((tag) => selectedTags.includes(tag)));
    }

    // Sort by title
    filtered.sort((a, b) => a.title.localeCompare(b.title));

    setFilteredPages(filtered);
  }, [searchTerm, selectedCategory, selectedTags, subPages]);

  if (loading) {
    return <div className="text-center py-8 text-neutral-500">Loading sub-pages...</div>;
  }

  if (subPages.length === 0) {
    return null; // Don't show section if no sub-pages
  }

  return (
    <div className="mt-12 border-t border-neutral-200 pt-8">
      <h2 className="text-3xl font-bold text-neutral-900 mb-6">Related Pages</h2>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          {(categories.length > 0 || allTags.length > 0) && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-neutral-300 rounded-lg flex items-center gap-2 hover:bg-neutral-50 transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="p-4 bg-neutral-50 rounded-lg space-y-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-neutral-600 mb-4">
        Showing {filteredPages.length} of {subPages.length} pages
      </p>

      {/* Sub-Page Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page) => (
          <Link
            key={page.id}
            to={`/pages/${page.fullSlug || page.slug}`}
            className="block p-6 border border-neutral-200 rounded-lg hover:shadow-lg hover:border-primary-300 transition-all"
          >
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">{page.title}</h3>
            {page.metaDescription && (
              <p className="text-neutral-600 text-sm mb-3 line-clamp-3">{page.metaDescription}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {page.category && (
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                  {page.category}
                </span>
              )}
              {page.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No pages found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

