'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckCircle2 } from 'lucide-react';

interface PaymentOption {
  id: string;
  name: string;
  monthlyPayment: number;
  totalCost: number;
  term: string;
  description: string;
  benefits: string[];
}

interface PaymentOptionCardsProps {
  options?: PaymentOption[];
  onSelect?: (optionId: string) => void;
}

const defaultOptions: PaymentOption[] = [
  {
    id: 'lease',
    name: 'Lightreach Lease',
    monthlyPayment: 89,
    totalCost: 32040,
    term: '20 years',
    description: 'Lowest monthly payment. We own and maintain the system.',
    benefits: [
      'Zero upfront cost',
      'Maintenance included',
      'Performance guarantee',
      'Transferable to next owner',
    ],
  },
  {
    id: 'finance',
    name: 'Financing',
    monthlyPayment: 145,
    totalCost: 52200,
    term: '15 years',
    description: 'Own your system. Access all incentives and tax credits.',
    benefits: [
      'Own the system',
      '30% federal tax credit',
      'Increase home value',
      'Lower monthly than utility bill',
    ],
  },
  {
    id: 'cash',
    name: 'Cash',
    monthlyPayment: 0,
    totalCost: 18500,
    term: 'Paid in full',
    description: 'Full ownership immediately. Maximize your savings.',
    benefits: [
      'Fastest ROI',
      'All incentives & credits',
      'No interest payments',
      'Maximum 25-year savings',
    ],
  },
];

const PaymentOptionCards: React.FC<PaymentOptionCardsProps> = ({
  options = defaultOptions,
  onSelect,
}) => {
  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-bebas text-3xl text-sun tracking-wide mb-2">
          Choose Your Payment Option
        </h2>
        <p className="text-gray-400">All include installation, permits, and grid connection</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option, idx) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <Card
              className={`h-full flex flex-col ${
                option.id === 'finance'
                  ? 'border-sun shadow-lg shadow-sun/20 scale-105'
                  : 'hover:border-sun/30'
              }`}
            >
              <div className="flex-1">
                <h3 className="font-bebas text-2xl text-sun tracking-wide mb-2">
                  {option.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{option.description}</p>

                <div className="mb-6">
                  {option.monthlyPayment > 0 ? (
                    <>
                      <div className="text-3xl font-bebas text-white mb-1">
                        ${option.monthlyPayment}
                        <span className="text-base text-gray-400">/mo</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Total: ${option.totalCost.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <div className="text-3xl font-bebas text-sun mb-1">
                      ${option.totalCost.toLocaleString()}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Term: {option.term}</p>
                </div>

                <div className="space-y-2">
                  {option.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sun flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                fullWidth
                variant={option.id === 'finance' ? 'primary' : 'secondary'}
                className="mt-6"
                onClick={() => onSelect?.(option.id)}
              >
                Select This Option
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PaymentOptionCards;
