import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedPages } from '../../services/pages';
import { Page } from '../../types';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [customPages, setCustomPages] = useState<Page[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        // Fetch all published pages and filter to root pages only
        const pages = await getPublishedPages();
        const rootPages = pages.filter((p) => !p.parentId);
        setCustomPages(rootPages);
      } catch (error) {
        console.error('Error fetching pages for footer:', error);
      }
    };
    fetchPages();
  }, []);

  return (
    <footer className="bg-neutral-800 text-neutral-300 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Tampa Bay HEAT</h3>
            <p className="text-sm">
              Empowering homeschool families through quality education, sports, and community.
            </p>
            <div className="mt-4">
              <h4 className="text-white font-semibold text-sm mb-2">Contact</h4>
              <ul className="space-y-1 text-sm">
                <li>Tampa Bay Area, FL</li>
                <li>
                  <a href="mailto:info@tampabayheat.org" className="hover:text-white transition-colors">
                    info@tampabayheat.org
                  </a>
                </li>
              </ul>
            </div>
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
              <li>
                <Link to="/volunteers" className="hover:text-white transition-colors">
                  Volunteer
                </Link>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">More</h3>
            <ul className="space-y-2 text-sm">
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
              <li>
                <Link to="/membership" className="hover:text-white transition-colors">
                  Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynamic Custom Pages (Root Pages Only) */}
          {customPages.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Pages</h3>
              <ul className="space-y-2 text-sm">
                {customPages.slice(0, 8).map((page) => (
                  <li key={page.id}>
                    <Link 
                      to={`/pages/${page.fullSlug || page.slug}`} 
                      className="hover:text-white transition-colors"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} Tampa Bay HEAT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

