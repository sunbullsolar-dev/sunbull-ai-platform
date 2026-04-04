'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  homeownerName?: string;
  onViewDashboard?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  homeownerName = 'John',
  onViewDashboard,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center py-12"
    >
      <div className="max-w-xl mx-auto text-center space-y-8">
        {/* Celebration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sun/20 border-2 border-sun mb-6">
            <CheckCircle2 className="w-12 h-12 text-sun" />
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="font-bebas text-5xl text-sun tracking-widest mb-4">
            Welcome to Sunbull, {homeownerName}!
          </h1>
          <p className="text-xl text-gray-300">
            Your solar agreement is signed and ready to go
          </p>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4 bg-surface rounded-lg border border-border p-8"
        >
          <h2 className="font-bebas text-2xl text-sun tracking-wide mb-6">
            What Happens Next
          </h2>
          <div className="space-y-4 text-left">
            {[
              {
                num: '1',
                title: 'Inspection Scheduled',
                desc: 'Our technician will assess your roof and electrical system',
              },
              {
                num: '2',
                title: 'Permitting',
                desc: 'We handle all local permits and inspections',
              },
              {
                num: '3',
                title: 'Installation',
                desc: 'Your system will be installed in 1-2 days',
              },
              {
                num: '4',
                title: 'System Live',
                desc: 'Start saving immediately with your new solar system',
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sun text-dark-bg flex items-center justify-center font-bebas">
                  {step.num}
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">{step.title}</p>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-sun/10 border border-sun rounded-lg p-8"
        >
          <h3 className="font-bebas text-xl text-sun tracking-wide mb-4">
            Your Solar Benefits
          </h3>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              'Real-time monitoring',
              'Lifetime support',
              '25-year warranty',
              'Free maintenance',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sun flex-shrink-0" />
                <span className="text-sm text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex gap-4"
        >
          <Button
            fullWidth
            onClick={onViewDashboard}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            View Your Dashboard
          </Button>
        </motion.div>

        {/* Contact */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-sm text-gray-500"
        >
          Questions? Contact our support team at{' '}
          <a href="mailto:support@sunbull.ai" className="text-sun hover:text-sun-dim">
            support@sunbull.ai
          </a>{' '}
          or call{' '}
          <a href="tel:+18005551234" className="text-sun hover:text-sun-dim">
            1-800-SUNBULL
          </a>
        </motion.p>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
