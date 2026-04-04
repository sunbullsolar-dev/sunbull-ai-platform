'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface ReviewCarouselProps {
  reviews?: Review[];
}

const defaultReviews: Review[] = [
  {
    id: '1',
    author: 'Sarah M., San Fernando Valley',
    rating: 5,
    text: 'The process was incredibly smooth. Got my proposal in literally 2 minutes. The installer arrived on schedule and finished in one day. Highly recommend!',
    date: '2 weeks ago',
  },
  {
    id: '2',
    author: 'James T., Encino',
    rating: 5,
    text: 'I was skeptical about online solar quotes, but this was different. The numbers matched the final contract exactly. No surprises, no upselling.',
    date: '1 month ago',
  },
  {
    id: '3',
    author: 'Maria G., Calabasas',
    rating: 5,
    text: 'Best experience with any service company. From quote to installation took less than 6 weeks. My electric bill went from $350 to $40.',
    date: '2 months ago',
  },
];

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({
  reviews = defaultReviews,
}) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % reviews.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const review = reviews[current];

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-sun text-sun"
                  />
                ))}
              </div>
              <p className="text-lg text-gray-200 mb-4 leading-relaxed">
                "{review.text}"
              </p>
              <div>
                <p className="font-medium text-sun">{review.author}</p>
                <p className="text-xs text-gray-400">{review.date}</p>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prev}
            className="p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-sun transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > current ? 1 : -1);
                  setCurrent(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? 'bg-sun w-8' : 'bg-border w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-sun transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCarousel;
