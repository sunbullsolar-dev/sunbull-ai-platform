'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PipelineTracker from '@/components/dashboard/PipelineTracker';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { Loader2, Mail, Phone, MapPin } from 'lucide-react';

interface DashboardPageClientProps {
  dealId: string;
}

const DashboardPageClient: React.FC<DashboardPageClientProps> = ({ dealId }) => {
  const { deal, timeline, loading, error } = useDashboard(dealId);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sun mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-bebas text-3xl text-sun tracking-widest mb-4">
            Oops!
          </h1>
          <p className="text-gray-400">
            {error || 'We couldn\'t load your dashboard'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-2">
                Your Solar Installation
              </h1>
              <p className="text-gray-400">Track your project from start to finish</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Contact Info */}
            <Card>
              <h2 className="font-bebas text-lg text-sun tracking-wide mb-4">
                Your Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sun" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-white">{deal.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sun" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm text-white">{deal.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-sun" />
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm text-white">{deal.address}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Details */}
            <Card>
              <h2 className="font-bebas text-lg text-sun tracking-wide mb-4">
                System Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">System Size</p>
                  <p className="text-sm text-white font-medium">{deal.systemKW} kW</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Panel Count</p>
                  <p className="text-sm text-white font-medium">{deal.panelCount} panels</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Monthly Payment</p>
                  <p className="text-sm text-sun font-medium">${deal.monthlyPayment}/month</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Info */}
          <Card className="mb-12 bg-sun/10 border-sun">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Payment Option</p>
                <p className="font-bebas text-lg text-sun">{deal.paymentOption}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Contract Signed</p>
                <p className="text-sm text-white">
                  {new Date(deal.contractSignedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Expected Completion</p>
                <p className="text-sm text-white">
                  {new Date(deal.expectedCompletionDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Pipeline Tracker */}
          <PipelineTracker dealId={dealId} />

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 bg-surface rounded-lg border border-border p-8 text-center"
          >
            <h2 className="font-bebas text-2xl text-sun tracking-wide mb-4">
              Have Questions?
            </h2>
            <p className="text-gray-400 mb-6">
              Our support team is here to help 24/7. Reach out anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+18005551234"
                className="px-6 py-2 bg-sun text-dark-bg rounded-lg font-medium hover:bg-sun-dim transition-colors"
              >
                Call 1-800-SUNBULL
              </a>
              <a
                href="mailto:support@sunbull.ai"
                className="px-6 py-2 border border-sun text-sun rounded-lg font-medium hover:bg-sun/10 transition-colors"
              >
                Email Support
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPageClient;
