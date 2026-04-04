'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bebas text-xl text-sun tracking-wide mb-4">
              SUNBULL AI
            </h3>
            <p className="text-sm text-gray-400">
              Solar savings in minutes. Zero paperwork. Lightning-fast installation.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium text-sun mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/get-quote" className="hover:text-sun transition-colors">
                  Get a Quote
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-sun transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-sun transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium text-sun mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-sun transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sun transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sun transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-sun mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-sun transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sun transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sun transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8">
          <p className="text-xs text-gray-500 text-center mb-4">
            Sunbull AI operates confidentially. All information is encrypted end-to-end. No
            third-party sharing without consent.
          </p>
          <p className="text-xs text-gray-600 text-center">
            Copyright 2024 Sunbull AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
