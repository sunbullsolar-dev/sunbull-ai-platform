'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataSource {
  name: string;
  description: string;
}

interface DataTransparencyProps {
  sources?: DataSource[];
}

const defaultSources: DataSource[] = [
  {
    name: 'Satellite Roof Analysis',
    description: 'Google Earth imagery to calculate roof size, pitch, and orientation',
  },
  {
    name: 'Utility Rate Database',
    description: 'Real-time rates from your utility provider',
  },
  {
    name: 'Equipment Pricing',
    description: 'Current manufacturer costs for solar panels and inverters',
  },
  {
    name: 'Installation Labor',
    description: 'Regional hourly rates for licensed installers',
  },
  {
    name: 'Incentive Database',
    description: 'Federal ITC, state rebates, and local incentives',
  },
  {
    name: 'Weather Data',
    description: '25 years of solar irradiance history for your location',
  },
];

const DataTransparency: React.FC<DataTransparencyProps> = ({
  sources = defaultSources,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-surface-2 rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface/50 transition-colors"
      >
        <span className="font-medium text-sun">How were these numbers calculated?</span>
        <ChevronDown
          className={`w-5 h-5 text-sun transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 py-4 bg-surface border-t border-border space-y-4">
          {sources.map((source) => (
            <div key={source.name}>
              <h4 className="text-sm font-medium text-sun mb-1">{source.name}</h4>
              <p className="text-xs text-gray-400">{source.description}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-border text-xs text-gray-500">
            <p>
              All calculations use industry-standard formulas. Your proposal updates in real-time
              if utility rates or incentives change.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DataTransparency;
