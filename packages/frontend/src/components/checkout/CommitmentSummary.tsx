'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckCircle2 } from 'lucide-react';

interface CommitmentSummaryProps {
  homeownerName?: string;
  systemKW?: number;
  panelCount?: number;
  monthlyPayment?: number;
  paymentOption?: string;
  utilityTotal?: number;
  solarTotal?: number;
  installerName?: string;
  installerLicense?: string;
  onGoBack?: () => void;
  onReady?: () => void;
  isLoading?: boolean;
}

const CommitmentSummary: React.FC<CommitmentSummaryProps> = ({
  homeownerName = 'John Doe',
  systemKW = 8,
  panelCount = 24,
  monthlyPayment = 145,
  paymentOption = 'Financing',
  utilityTotal = 150000,
  solarTotal = 45000,
  installerName = 'Licensed Solar Installers',
  installerLicense = 'CA License #12345',
  onGoBack,
  onReady,
  isLoading = false,
}) => {
  const savings = utilityTotal - solarTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl text-sun tracking-wide mb-2">
            You're Almost There
          </h1>
          <p className="text-gray-400">
            Review your commitment before signing electronically below
          </p>
        </div>

        {/* System Details */}
        <Card>
          <h2 className="font-bebas text-xl text-sun tracking-wide mb-4">
            System Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Homeowner</p>
              <p className="text-sm font-medium text-white">{homeownerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">System Size</p>
              <p className="text-sm font-medium text-white">{systemKW} kW</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Panel Count</p>
              <p className="text-sm font-medium text-white">{panelCount} panels</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Payment Plan</p>
              <p className="text-sm font-medium text-sun">{paymentOption}</p>
            </div>
          </div>
        </Card>

        {/* Payment Details */}
        <Card>
          <h2 className="font-bebas text-xl text-sun tracking-wide mb-4">
            Monthly Commitment
          </h2>
          <div className="text-center py-4">
            <p className="text-xs text-gray-400 mb-1">Your Monthly Payment</p>
            <p className="text-5xl font-bebas text-sun">${monthlyPayment}</p>
            <p className="text-xs text-gray-400 mt-2">
              vs. current utility bill averaging ${Math.round(utilityTotal / 300)}/month
            </p>
          </div>
        </Card>

        {/* 25-Year Savings */}
        <Card className="bg-sun/10 border-sun">
          <h2 className="font-bebas text-xl text-sun tracking-wide mb-4">
            25-Year Savings Guarantee
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Utility Cost</p>
              <p className="text-2xl font-bebas text-gray-300">
                ${(utilityTotal / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Solar Cost</p>
              <p className="text-2xl font-bebas text-gray-300">
                ${(solarTotal / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-sun mb-1">YOUR SAVINGS</p>
              <p className="text-2xl font-bebas text-sun">
                ${(savings / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </Card>

        {/* Installer Info */}
        <Card>
          <h2 className="font-bebas text-xl text-sun tracking-wide mb-4">
            Your Installer
          </h2>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sun/20 border border-sun flex items-center justify-center">
              <span className="text-lg font-bebas text-sun">⚡</span>
            </div>
            <div>
              <p className="font-medium text-white">{installerName}</p>
              <p className="text-sm text-gray-400">{installerLicense}</p>
              <p className="text-xs text-sun mt-2 flex items-center gap-2">
                <CheckCircle2 size={14} />
                Bond & Insured • 15+ Years Experience
              </p>
            </div>
          </div>
        </Card>

        {/* Checklist */}
        <Card className="bg-green-900/10 border-green-500/30">
          <div className="space-y-3">
            {[
              'System designed for your home',
              'All local permits & inspections included',
              'Performance monitoring for 25 years',
              'Transferable warranty to next owner',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="flex gap-4 pt-6">
          <Button variant="outline" fullWidth onClick={onGoBack}>
            Go Back
          </Button>
          <Button
            fullWidth
            onClick={onReady}
            isLoading={isLoading}
          >
            I'm Ready to Sign
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommitmentSummary;
