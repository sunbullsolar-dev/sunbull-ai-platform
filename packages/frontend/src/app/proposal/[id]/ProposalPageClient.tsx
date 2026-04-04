'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import HeroNumbers from '@/components/proposal/HeroNumbers';
import ComparisonChart from '@/components/proposal/ComparisonChart';
import PaymentOptionCards from '@/components/proposal/PaymentOptionCards';
import DataTransparency from '@/components/trust/DataTransparency';
import TrustBlock from '@/components/proposal/TrustBlock';
import { useProposal } from '@/lib/hooks/useProposal';
import { Loader2 } from 'lucide-react';

interface ProposalPageClientProps {
  id: string;
}

const ProposalPageClient: React.FC<ProposalPageClientProps> = ({ id }) => {
  const router = useRouter();
  const proposalId = id;

  const { proposal, loading, error } = useProposal(proposalId);

  const handleSelectPaymentOption = (optionId: string) => {
    router.push(`/checkout/${proposalId}?option=${optionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sun mx-auto mb-4" />
          <p className="text-gray-400">Loading your proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-bebas text-3xl text-sun tracking-widest mb-4">
            Something Went Wrong
          </h1>
          <p className="text-gray-400 mb-6">
            {error || 'We couldn\'t load your proposal. Please try again.'}
          </p>
          <Button onClick={() => router.push('/get-quote')}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg">
      {/* Hero Section */}
      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroNumbers
            homeownerName={proposal.homeownerName}
            panelCount={proposal.panelCount}
            systemKW={proposal.systemKW}
            offsetPercentage={proposal.offsetPercentage}
            currentMonthlyBill={proposal.currentMonthlyBill}
          />
        </div>
      </section>

      {/* Comparison Chart */}
      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ComparisonChart
            utilityTotal={proposal.utilityTotal}
            solarTotal={proposal.solarTotal}
          />
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PaymentOptionCards onSelect={handleSelectPaymentOption} />
        </div>
      </section>

      {/* Data Transparency */}
      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <DataTransparency />
          </motion.div>
        </div>
      </section>

      {/* Trust Block */}
      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrustBlock />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-bebas text-4xl text-sun tracking-wide mb-4">
              Ready to Go Solar?
            </h2>
            <p className="text-gray-400 mb-8">
              Choose your payment option above to get started. All systems are guaranteed to
              save you money.
            </p>
            <div className="bg-sun/10 border border-sun rounded-lg p-6">
              <p className="text-sm text-gray-300 mb-4">
                Questions? We're here to help.
              </p>
              <a
                href="tel:+18005551234"
                className="inline-block px-6 py-2 bg-sun text-dark-bg rounded-lg font-medium hover:bg-sun-dim transition-colors mb-3 mr-3"
              >
                Call Us: 1-800-SUNBULL
              </a>
              <a
                href="mailto:support@sunbull.ai"
                className="inline-block px-6 py-2 border border-sun text-sun rounded-lg font-medium hover:bg-sun/10 transition-colors"
              >
                Email Support
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProposalPageClient;
