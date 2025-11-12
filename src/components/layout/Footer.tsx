import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-neutral-300 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Tampa Bay HEAT</h3>
            <p className="text-sm">
              Empowering homeschool families through quality education, sports, and community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/classes" className="hover:text-white transition-colors">
                  Classes
                </Link>
              </li>
              <li>
                <Link to="/sports" className="hover:text-white transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-white transition-colors">
                  Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Resource Center
                </Link>
              </li>
              <li>
                <Link to="/instructors" className="hover:text-white transition-colors">
                  Instructors
                </Link>
              </li>
              <li>
                <Link to="/statement-of-faith" className="hover:text-white transition-colors">
                  Statement of Faith
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Tampa Bay Area, FL</li>
              <li>
                <a href="mailto:info@tampabayheat.org" className="hover:text-white transition-colors">
                  info@tampabayheat.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} Tampa Bay HEAT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

