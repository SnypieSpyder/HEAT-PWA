import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../hooks/useFirestore';
import { Sport } from '../../types';
import { Card, CardContent, Badge, Button, Spinner } from '../../components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const SportsPage: React.FC = () => {
  const { data: sports, loading } = useCollection<Sport>('sports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const filteredSports = sports.filter((sport) => {
    const matchesSearch =
      sport.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sport.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || sport.sportType === selectedSport;
    return matchesSearch && matchesSport && sport.status === 'active';
  });

  const sportTypes = Array.from(new Set(sports.map((s) => s.sportType).filter(Boolean)));

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Sports</h1>
          <p className="text-xl text-neutral-600">
            Join our competitive and recreational sports programs
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search sports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {sportTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSport('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSport === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                All Sports
              </button>
              {sportTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedSport(type!)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSport === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && filteredSports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No sports programs found matching your criteria.</p>
          </div>
        )}

        {!loading && filteredSports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSports.map((sport) => (
              <Card key={sport.id} hover>
                <CardContent>
                  {sport.imageURL && (
                    <img
                      src={sport.imageURL}
                      alt={sport.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-neutral-900">{sport.title}</h3>
                    <Badge variant={sport.status === 'full' ? 'warning' : 'success'}>
                      {sport.enrolled}/{sport.capacity}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <Badge variant="primary">{sport.sportType}</Badge>
                    <Badge variant="info">{sport.season}</Badge>
                  </div>
                  
                  {sport.coachName && (
                    <p className="text-sm text-neutral-600 mb-2">Coach: {sport.coachName}</p>
                  )}
                  
                  <p className="text-neutral-700 mb-4 line-clamp-3">{sport.description}</p>
                  
                  <div className="space-y-2 text-sm text-neutral-600 mb-4">
                    <p>
                      <span className="font-medium">Age Group:</span> {sport.ageGroup}
                    </p>
                    <p>
                      <span className="font-medium">Price:</span> ${sport.pricing}
                    </p>
                  </div>
                  
                  <Link to={`/sports/${sport.id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

