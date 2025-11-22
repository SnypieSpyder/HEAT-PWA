import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../hooks/useFirestore';
import { Sport } from '../../types';
import { Card, CardContent, Badge, Button, Spinner, RangeSlider } from '../../components/ui';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const SportsPage: React.FC = () => {
  const { data: sports, loading } = useCollection<Sport>('sports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [coachSearch, setCoachSearch] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 18]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCoachDropdown, setShowCoachDropdown] = useState(false);

  // Parse age from string like "5-7" or "8-10" or "U12"
  const parseAgeRange = (ageStr: string | undefined): [number, number] => {
    if (!ageStr) return [0, 18];
    const match = ageStr.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      return [min, max];
    }
    // Handle "U12" format
    const uMatch = ageStr.match(/U(\d+)/i);
    if (uMatch) {
      const max = parseInt(uMatch[1]);
      return [0, max];
    }
    return [0, 18];
  };

  const filteredSports = sports.filter((sport) => {
    const matchesSearch =
      sport.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sport.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || sport.sportType === selectedSport;
    const matchesCoach =
      !coachSearch || sport.coachName?.toLowerCase().includes(coachSearch.toLowerCase());
    
    // Age range filter
    const [sportMinAge, sportMaxAge] = parseAgeRange(sport.ageGroup);
    const matchesAge = sportMinAge <= ageRange[1] && sportMaxAge >= ageRange[0];
    
    // Day filter - match if no days selected or if any selected day is in schedule
    const matchesDay =
      selectedDays.length === 0 || sport.schedule.dayOfWeek.some(day => selectedDays.includes(day));
    
    return matchesSearch && matchesSport && matchesCoach && matchesAge && matchesDay && sport.status === 'active';
  });

  const sportTypes = Array.from(new Set(sports.map((s) => s.sportType).filter(Boolean)));
  const coaches = Array.from(new Set(sports.map((s) => s.coachName).filter(Boolean))).sort();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredCoaches = coaches.filter(coach =>
    coach.toLowerCase().includes(coachSearch.toLowerCase())
  );

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const clearAllFilters = () => {
    setSelectedSport('all');
    setCoachSearch('');
    setSelectedDays([]);
    setAgeRange([0, 18]);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedSport !== 'all' || coachSearch !== '' || selectedDays.length > 0 || ageRange[0] !== 0 || ageRange[1] !== 18 || searchTerm !== '';

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Sports</h1>
          <p className="text-xl text-neutral-600">
            Join our competitive and recreational sports programs
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search sports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
              {hasActiveFilters && !showFilters && (
                <span className="ml-1 bg-white text-primary-600 rounded-full px-2 py-0.5 text-xs font-bold">
                  {(selectedSport !== 'all' ? 1 : 0) + 
                   (coachSearch ? 1 : 0) + 
                   (selectedDays.length > 0 ? 1 : 0) +
                   (ageRange[0] !== 0 || ageRange[1] !== 18 ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900">Filter Options</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Row 1: Sport Type and Coach */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sport Type Filter */}
                    {sportTypes.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Sport Type
                        </label>
                        <select
                          value={selectedSport}
                          onChange={(e) => setSelectedSport(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="all">All Sports</option>
                          {sportTypes.map((type) => (
                            <option key={type} value={type!}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Coach Search */}
                    {coaches.length > 0 && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Coach
                        </label>
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="Search coaches..."
                            value={coachSearch}
                            onChange={(e) => {
                              setCoachSearch(e.target.value);
                              setShowCoachDropdown(true);
                            }}
                            onFocus={() => setShowCoachDropdown(true)}
                            onBlur={() => setTimeout(() => setShowCoachDropdown(false), 200)}
                            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          {showCoachDropdown && coachSearch && filteredCoaches.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredCoaches.map((coach) => (
                                <button
                                  key={coach}
                                  onMouseDown={() => {
                                    setCoachSearch(coach);
                                    setShowCoachDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-primary-50 text-neutral-700 text-sm"
                                >
                                  {coach}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Age Range Slider */}
                  <RangeSlider
                    min={0}
                    max={18}
                    value={ageRange}
                    onChange={setAgeRange}
                    label="Age Range"
                    formatValue={(v) => `${v} years`}
                  />

                  {/* Row 3: Day Checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Days of Week
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {days.map((day) => (
                        <label
                          key={day}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={() => toggleDay(day)}
                            className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-neutral-700 group-hover:text-primary-600 transition-colors">
                            {day}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

