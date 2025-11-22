import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../../ui/Input';
import { Spinner } from '../../ui/Spinner';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { searchFamilies } from '../../../services/families';

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'member';
  familyId?: string;
  userId?: string;
}

interface UserSearchInputProps {
  onSelect: (result: UserSearchResult) => void;
  placeholder?: string;
  label?: string;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({
  onSelect,
  placeholder = 'Search by name or email...',
  label,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const families = await searchFamilies(searchTerm);
        
        const searchResults: UserSearchResult[] = [];
        
        families.forEach(family => {
          // Add primary contact
          const primaryContact = family.members.find(m => m.id === family.primaryContactId);
          if (primaryContact) {
            searchResults.push({
              id: primaryContact.id,
              name: `${primaryContact.firstName} ${primaryContact.lastName}`,
              email: primaryContact.email || '',
              type: 'member',
              familyId: family.id,
            });
          }

          // Add other family members
          family.members
            .filter(m => m.id !== family.primaryContactId && m.email)
            .forEach(member => {
              searchResults.push({
                id: member.id,
                name: `${member.firstName} ${member.lastName}`,
                email: member.email || '',
                type: 'member',
                familyId: family.id,
              });
            });
        });

        setResults(searchResults);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelect = (result: UserSearchResult) => {
    onSelect(result);
    setSearchTerm('');
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>}
      
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="pl-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-[100] mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-neutral-200">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-start space-x-3 border-b border-neutral-100 last:border-b-0"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{result.name}</p>
                <p className="text-xs text-neutral-500">{result.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchTerm.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-[100] mt-1 w-full bg-white rounded-md shadow-lg border border-neutral-200 px-4 py-3">
          <p className="text-sm text-neutral-500">No users found</p>
        </div>
      )}
    </div>
  );
};

