'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ComparisonChartProps {
  utilityTotal?: number;
  solarTotal?: number;
  years?: number;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  utilityTotal = 150000,
  solarTotal = 45000,
  years = 25,
}) => {
  const data = [
    {
      name: '25-Year Total',
      Utility: utilityTotal,
      Solar: solarTotal,
    },
  ];

  const savings = utilityTotal - solarTotal;
  const savingsPercent = Math.round((savings / utilityTotal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-12"
    >
      <div className="text-center mb-8">
        <h2 className="font-bebas text-3xl text-sun tracking-wide mb-4">
          Your 25-Year Comparison
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-lg border border-border p-4">
            <p className="text-xs text-gray-400 mb-1">Utility Cost</p>
            <p className="text-2xl font-bebas text-gray-200">
              ${(utilityTotal / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-4">
            <p className="text-xs text-gray-400 mb-1">Solar Cost</p>
            <p className="text-2xl font-bebas text-gray-200">
              ${(solarTotal / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-surface rounded-lg border border-sun p-4">
            <p className="text-xs text-sun mb-1">YOUR SAVINGS</p>
            <p className="text-2xl font-bebas text-sun">
              ${(savings / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-sun mt-1">{savingsPercent}% less</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="name" stroke="#666666" />
            <YAxis stroke="#666666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '8px',
              }}
              formatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Legend />
            <Bar dataKey="Utility" fill="#666666" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Solar" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ComparisonChart;
