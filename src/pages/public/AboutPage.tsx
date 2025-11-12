import React from 'react';
import { Card, CardContent } from '../../components/ui';

export const AboutPage: React.FC = () => {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            About Tampa Bay HEAT
          </h1>
          <p className="text-xl text-neutral-600">
            Homeschool Education And Training
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Mission</h2>
            <p className="text-neutral-700 leading-relaxed">
              Tampa Bay HEAT is dedicated to supporting homeschool families in the Tampa Bay area
              by providing quality educational classes, competitive sports programs, and enriching
              community events. We believe in fostering excellence in academics, character
              development, and physical fitness while building a strong, supportive community of
              like-minded families.
            </p>
          </CardContent>
        </Card>

        {/* What We Do */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">What We Do</h2>
            <div className="space-y-4 text-neutral-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">Educational Classes</h3>
                <p>
                  We offer a wide range of classes taught by qualified instructors, covering
                  subjects from core academics to arts, sciences, and practical life skills. Our
                  classes are designed to complement your home curriculum and provide opportunities
                  for collaborative learning.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Sports Programs</h3>
                <p>
                  Our sports programs provide homeschool students with opportunities to compete,
                  develop athletic skills, and learn teamwork. We offer both recreational and
                  competitive options across various sports throughout the year.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Community Events</h3>
                <p>
                  From field trips to social gatherings, our events bring families together and
                  create lasting memories. These activities foster friendships and provide
                  enrichment opportunities beyond the classroom.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Values</h2>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start">
                <span className="text-primary-600 font-bold mr-2">•</span>
                <span>
                  <strong>Excellence:</strong> We strive for high-quality programs and instruction
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 font-bold mr-2">•</span>
                <span>
                  <strong>Community:</strong> We build supportive relationships among families
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 font-bold mr-2">•</span>
                <span>
                  <strong>Character:</strong> We emphasize integrity, respect, and personal growth
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 font-bold mr-2">•</span>
                <span>
                  <strong>Faith:</strong> We honor Christian values while welcoming all families
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 font-bold mr-2">•</span>
                <span>
                  <strong>Flexibility:</strong> We support diverse homeschool approaches and styles
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardContent>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our History</h2>
            <p className="text-neutral-700 leading-relaxed">
              Founded by homeschool families in the Tampa Bay area, HEAT has grown from a small
              group of families meeting for co-op classes to a thriving organization serving
              hundreds of families. Our commitment to excellence and community has remained constant
              as we've expanded our programs to meet the growing needs of the homeschool community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

