import React from 'react';
import { useCollection } from '../../hooks/useFirestore';
import { Instructor } from '../../types';
import { Card, CardContent, Spinner } from '../../components/ui';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export const InstructorsPage: React.FC = () => {
  const { data: instructors, loading } = useCollection<Instructor>('instructors');

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Our Instructors
          </h1>
          <p className="text-xl text-neutral-600">
            Meet the dedicated educators who make Tampa Bay HEAT exceptional
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Instructors Grid */}
        {!loading && instructors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No instructors found. Check back soon!</p>
          </div>
        )}

        {!loading && instructors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((instructor) => (
              <Card key={instructor.id} hover>
                <CardContent className="text-center">
                  {/* Photo */}
                  {instructor.photoURL ? (
                    <img
                      src={instructor.photoURL}
                      alt={`${instructor.firstName} ${instructor.lastName}`}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-32 h-32 text-neutral-400 mx-auto mb-4" />
                  )}

                  {/* Name */}
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {instructor.firstName} {instructor.lastName}
                  </h3>

                  {/* Specialties */}
                  {instructor.specialties && instructor.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {instructor.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-neutral-600 text-sm text-left">{instructor.bio}</p>

                  {/* Contact */}
                  {instructor.email && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <a
                        href={`mailto:${instructor.email}`}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Contact Instructor
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

