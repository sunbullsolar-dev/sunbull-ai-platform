'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CommitmentSummary from '@/components/checkout/CommitmentSummary';
import InspectionScheduler from '@/components/checkout/InspectionScheduler';
import WelcomeScreen from '@/components/checkout/WelcomeScreen';
import { apiClient } from '@/lib/api';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

type Step = 'confirm' | 'summary' | 'financing' | 'docusign' | 'inspection' | 'welcome';

interface CheckoutPageClientProps {
  proposalId: string;
}

const CheckoutPageClient: React.FC<CheckoutPageClientProps> = ({ proposalId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedOption = searchParams.get('option') || 'finance';

  const [step, setStep] = useState<Step>('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPaymentOption = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.selectPaymentOption(proposalId, selectedOption);
      setStep('summary');
    } catch (err) {
      setError(apiClient.getErrorMessage(err));
    }
    setLoading(false);
  };

  const handleReadyToSign = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get DocuSign URL
      const docResponse = await apiClient.getDocuSignUrl(proposalId);
      // In real implementation, you'd embed DocuSign iframe here
      // For now, simulate the signing flow
      setTimeout(() => {
        setStep('inspection');
      }, 1000);
    } catch (err) {
      setError(apiClient.getErrorMessage(err));
    }
    setLoading(false);
  };

  const handleScheduleInspection = async (date: string, time: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.scheduleInspection(proposalId, date, time);
      setStep('welcome');
    } catch (err) {
      setError(apiClient.getErrorMessage(err));
    }
    setLoading(false);
  };

  const paymentOptions: Record<string, { name: string; monthly: number }> = {
    lease: { name: 'Lightreach Lease', monthly: 89 },
    finance: { name: 'Financing', monthly: 145 },
    cash: { name: 'Cash', monthly: 0 },
  };

  return (
    <div className="min-h-screen bg-dark-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[
              { step: 'summary', label: 'Review' },
              { step: 'docusign', label: 'Sign' },
              { step: 'inspection', label: 'Schedule' },
              { step: 'welcome', label: 'Complete' },
            ].map((item, idx, arr) => (
              <React.Fragment key={item.step}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bebas transition-all ${
                      step === item.step
                        ? 'bg-sun text-dark-bg ring-2 ring-sun ring-offset-2 ring-offset-dark-bg'
                        : ['summary', 'docusign', 'inspection'].includes(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-surface border border-border text-gray-400'
                    }`}
                  >
                    {(['summary', 'docusign', 'inspection'].includes(step) &&
                      arr.indexOf(item) <
                        arr.findIndex((i) => i.step === step)) ||
                    step === 'welcome' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{item.label}</span>
                </motion.div>
                {idx < arr.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      ['summary', 'docusign', 'inspection'].includes(step) &&
                      arr.indexOf(item) < arr.findIndex((i) => i.step === step)
                        ? 'bg-green-500'
                        : 'bg-border'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {step === 'summary' && (
            <CommitmentSummary
              homeownerName="John Doe"
              systemKW={8}
              panelCount={24}
              monthlyPayment={paymentOptions[selectedOption]?.monthly || 145}
              paymentOption={paymentOptions[selectedOption]?.name || 'Financing'}
              utilityTotal={150000}
              solarTotal={45000}
              onGoBack={() => router.back()}
              onReady={handleReadyToSign}
              isLoading={loading}
            />
          )}

          {step === 'docusign' && (
            <Card className="p-8">
              <div className="text-center">
                <h2 className="font-bebas text-3xl text-sun tracking-wide mb-4">
                  Sign Your Agreement
                </h2>
                <p className="text-gray-400 mb-8">
                  Review and electronically sign your solar agreement below
                </p>
                <div className="bg-surface rounded-lg border border-border h-96 flex items-center justify-center mb-8">
                  <p className="text-gray-500">DocuSign iframe would be embedded here</p>
                </div>
                <Button
                  fullWidth
                  onClick={() => setStep('inspection')}
                  isLoading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Schedule
                </Button>
              </div>
            </Card>
          )}

          {step === 'inspection' && (
            <InspectionScheduler
              onConfirm={handleScheduleInspection}
              isLoading={loading}
            />
          )}

          {step === 'welcome' && (
            <WelcomeScreen
              homeownerName="John"
              onViewDashboard={() => router.push(`/dashboard/${proposalId}`)}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPageClient;
