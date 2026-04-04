'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeroNumbersProps {
  homeownerName?: string;
  panelCount?: number;
  systemKW?: number;
  offsetPercentage?: number;
  currentMonthlyBill?: number;
}

const HeroNumbers: React.FC<HeroNumbersProps> = ({
  homeownerName = 'John',
  panelCount = 24,
  systemKW = 8,
  offsetPercentage = 95,
  currentMonthlyBill = 250,
}) => {
  const metrics = [
    { label: 'Solar Panels', value: panelCount, unit: '' },
    { label: 'System Size', value: systemKW, unit: 'kW' },
    { label: 'Energy Offset', value: offsetPercentage, unit: '%' },
    { label: 'Current Bill', value: currentMonthlyBill, unit: '/mo' },
  ];

  return (
    <div className="py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h1 className="font-bebas text-4xl md:text-5xl lg:text-6xl text-sun tracking-widest mb-2">
          {homeownerName}'s Solar Proposal
        </h1>
        <p className="text-gray-400">Custom system designed for your home</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="bg-surface rounded-lg border border-border p-6 text-center"
          >
            <div className="text-3xl md:text-4xl font-bebas text-sun tracking-wide mb-2">
              {metric.value}
              <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-400">{metric.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HeroNumbers;
