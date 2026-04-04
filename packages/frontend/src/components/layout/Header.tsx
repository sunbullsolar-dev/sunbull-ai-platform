'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-bebas text-2xl text-sun tracking-widest">
            SUNBULL AI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-sm text-gray-300 hover:text-sun transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm text-gray-300 hover:text-sun transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-sm text-gray-300 hover:text-sun transition-colors"
            >
              FAQ
            </Link>
            <Button asChild>
              <Link href="/get-quote">Get Quote</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-sun hover:text-sun-dim transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-4">
            <Link
              href="#how-it-works"
              className="block text-sm text-gray-300 hover:text-sun transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="block text-sm text-gray-300 hover:text-sun transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="block text-sm text-gray-300 hover:text-sun transition-colors"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>
            <Button asChild fullWidth>
              <Link href="/get-quote" onClick={() => setIsOpen(false)}>
                Get Quote
              </Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
