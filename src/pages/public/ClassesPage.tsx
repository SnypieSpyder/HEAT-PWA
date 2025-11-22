import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../hooks/useFirestore';
import { Class } from '../../types';
import { Card, CardContent, Badge, Button, Spinner, RangeSlider } from '../../components/ui';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const ClassesPage: React.FC = () => {
  const { data: classes, loading } = useCollection<Class>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [instructorSearch, setInstructorSearch] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 18]);
  const [gradeRange, setGradeRange] = useState<[number, number]>([0, 12]);
  const [showFilters, setShowFilters] = useState(false);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);

  // Parse age from string like "5-7 years" or "8+ years"
  const parseAgeRange = (ageStr: string | undefined): [number, number] => {
    if (!ageStr) return [0, 18];
    const match = ageStr.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : (ageStr.includes('+') ? 18 : min);
      return [min, max];
    }
    return [0, 18];
  };

  // Parse grade from string like "K-2" or "6-8"
  const parseGradeRange = (gradeStr: string | undefined): [number, number] => {
    if (!gradeStr) return [0, 12];
    const match = gradeStr.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      return [min, max];
    }
    if (gradeStr.toLowerCase().includes('k')) return [0, 0];
    return [0, 12];
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || cls.category === selectedCategory;
    const matchesInstructor =
      !instructorSearch || cls.instructorName?.toLowerCase().includes(instructorSearch.toLowerCase());
    
    // Age range filter
    const [classMinAge, classMaxAge] = parseAgeRange(cls.ageRequirement);
    const matchesAge = classMinAge <= ageRange[1] && classMaxAge >= ageRange[0];
    
    // Grade range filter
    const [classMinGrade, classMaxGrade] = parseGradeRange(cls.gradeRequirement);
    const matchesGrade = classMinGrade <= gradeRange[1] && classMaxGrade >= gradeRange[0];
    
    // Day filter - match if no days selected or if any selected day is in schedule
    const matchesDay =
      selectedDays.length === 0 || cls.schedule.dayOfWeek.some(day => selectedDays.includes(day));
    
    return matchesSearch && matchesCategory && matchesInstructor && matchesAge && matchesGrade && matchesDay && cls.status === 'active';
  });

  const categories = Array.from(new Set(classes.map((cls) => cls.category).filter(Boolean)));
  const instructors = Array.from(new Set(classes.map((cls) => cls.instructorName).filter(Boolean))).sort();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredInstructors = instructors.filter(instructor =>
    instructor.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setInstructorSearch('');
    setSelectedDays([]);
    setAgeRange([0, 18]);
    setGradeRange([0, 12]);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || instructorSearch !== '' || selectedDays.length > 0 || ageRange[0] !== 0 || ageRange[1] !== 18 || gradeRange[0] !== 0 || gradeRange[1] !== 12 || searchTerm !== '';

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Classes</h1>
          <p className="text-xl text-neutral-600">
            Explore our wide range of educational offerings
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
                placeholder="Search classes..."
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
                  {(selectedCategory !== 'all' ? 1 : 0) + 
                   (instructorSearch ? 1 : 0) + 
                   (selectedDays.length > 0 ? 1 : 0) +
                   (ageRange[0] !== 0 || ageRange[1] !== 18 ? 1 : 0) +
                   (gradeRange[0] !== 0 || gradeRange[1] !== 12 ? 1 : 0)}
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
                  {/* Row 1: Category and Instructor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category!}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Instructor Search */}
                    {instructors.length > 0 && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Instructor
                        </label>
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="Search instructors..."
                            value={instructorSearch}
                            onChange={(e) => {
                              setInstructorSearch(e.target.value);
                              setShowInstructorDropdown(true);
                            }}
                            onFocus={() => setShowInstructorDropdown(true)}
                            onBlur={() => setTimeout(() => setShowInstructorDropdown(false), 200)}
                            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          {showInstructorDropdown && instructorSearch && filteredInstructors.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredInstructors.map((instructor) => (
                                <button
                                  key={instructor}
                                  onMouseDown={() => {
                                    setInstructorSearch(instructor);
                                    setShowInstructorDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-primary-50 text-neutral-700 text-sm"
                                >
                                  {instructor}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Age and Grade Range Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Range Slider */}
                    <RangeSlider
                      min={0}
                      max={18}
                      value={ageRange}
                      onChange={setAgeRange}
                      label="Age Range"
                      formatValue={(v) => `${v} years`}
                    />

                    {/* Grade Range Slider */}
                    <RangeSlider
                      min={0}
                      max={12}
                      value={gradeRange}
                      onChange={setGradeRange}
                      label="Grade Range"
                      formatValue={(v) => v === 0 ? 'K' : `Grade ${v}`}
                    />
                  </div>

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

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Classes Grid */}
        {!loading && filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No classes found matching your criteria.</p>
          </div>
        )}

        {!loading && filteredClasses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} hover>
                <CardContent>
                  {cls.imageURL && (
                    <img
                      src={cls.imageURL}
                      alt={cls.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-neutral-900">{cls.title}</h3>
                    <Badge variant={cls.status === 'full' ? 'warning' : 'success'}>
                      {cls.enrolled}/{cls.capacity}
                    </Badge>
                  </div>
                  
                  {cls.instructorName && (
                    <p className="text-sm text-neutral-600 mb-2">
                      Instructor: {cls.instructorName}
                    </p>
                  )}
                  
                  <p className="text-neutral-700 mb-4 line-clamp-3">{cls.description}</p>
                  
                  <div className="space-y-2 text-sm text-neutral-600 mb-4">
                    <p>
                      <span className="font-medium">Schedule:</span>{' '}
                      {cls.schedule.dayOfWeek.join(', ')} {cls.schedule.startTime} - {cls.schedule.endTime}
                    </p>
                    <p>
                      <span className="font-medium">Price:</span> ${cls.pricing}
                    </p>
                    {cls.ageRequirement && (
                      <p>
                        <span className="font-medium">Age:</span> {cls.ageRequirement}
                      </p>
                    )}
                  </div>
                  
                  <Link to={`/classes/${cls.id}`}>
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

