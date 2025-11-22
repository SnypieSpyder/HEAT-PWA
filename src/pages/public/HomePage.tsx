import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '../../components/ui';
import {
  AcademicCapIcon,
  TrophyIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Quality Classes',
      description: 'Expert-led courses across various subjects and skill levels',
      link: '/classes',
    },
    {
      icon: TrophyIcon,
      title: 'Sports Programs',
      description: 'Competitive and recreational sports for all ages',
      link: '/sports',
    },
    {
      icon: CalendarIcon,
      title: 'Events & Activities',
      description: 'Community events, field trips, and special activities',
      link: '/events',
    },
    {
      icon: UserGroupIcon,
      title: 'Strong Community',
      description: 'Connect with other homeschool families in Tampa Bay',
      link: '/about',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient-animated text-white relative overflow-hidden">
        <div className="container-custom py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Tampa Bay HEAT
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Empowering homeschool families through quality education, sports, and community
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth/signup">
                <Button size="lg" className="!bg-white !text-primary-600 hover:!bg-neutral-100">
                  Get Started
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-primary-600">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            What We Offer
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Comprehensive programs designed to support your homeschool journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.link}>
              <Card hover className="h-full">
                <CardContent className="text-center">
                  <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-100 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Become part of the Tampa Bay HEAT family and give your children access to
            exceptional educational opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg">Sign Up Now</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            What Families Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Tampa Bay HEAT has been a blessing to our family. The classes are excellent and the community is so supportive!",
              author: "The Johnson Family",
            },
            {
              quote: "My kids look forward to their classes every week. The instructors are passionate and knowledgeable.",
              author: "Sarah M.",
            },
            {
              quote: "We've found our homeschool tribe! The events and activities have enriched our journey so much.",
              author: "The Martinez Family",
            },
          ].map((testimonial, index) => (
            <Card key={index}>
              <CardContent>
                <p className="text-neutral-700 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-primary-600 font-semibold">— {testimonial.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

