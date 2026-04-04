'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface InstallCounterProps {
  target?: number;
  suffix?: string;
  duration?: number;
  location?: string;
}

const InstallCounter: React.FC<InstallCounterProps> = ({
  target = 1500,
  suffix = '+',
  duration = 3,
  location = 'San Fernando Valley',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return target;
        }
        return prev + Math.ceil(target / 60);
      });
    }, duration / 60 * 1000);

    return () => clearInterval(interval);
  }, [target, duration]);

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="inline-block"
      >
        <div className="text-5xl md:text-6xl font-bebas text-sun tracking-widest mb-2">
          {count}
          {suffix}
        </div>
        <p className="text-lg text-gray-300">
          Solar installations in {location}
        </p>
      </motion.div>
    </div>
  );
};

export default InstallCounter;
