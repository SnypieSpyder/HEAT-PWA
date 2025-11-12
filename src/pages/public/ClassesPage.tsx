import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../hooks/useFirestore';
import { Class } from '../../types';
import { Card, CardContent, Badge, Button, Spinner } from '../../components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const ClassesPage: React.FC = () => {
  const { data: classes, loading } = useCollection<Class>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || cls.category === selectedCategory;
    return matchesSearch && matchesCategory && cls.status === 'active';
  });

  const categories = Array.from(new Set(classes.map((cls) => cls.category).filter(Boolean)));

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
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category!)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
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

