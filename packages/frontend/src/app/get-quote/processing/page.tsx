'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface StatusMessage {
  step: number;
  message: string;
  icon: string;
}

const ProcessingPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get('proposalId');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const messages: StatusMessage[] = [
    { step: 1, message: 'Analyzing your roof...', icon: '🏠' },
    { step: 2, message: 'Pulling utility rates...', icon: '⚡' },
    { step: 3, message: 'Calculating your savings...', icon: '💰' },
    { step: 4, message: 'Building your proposal...', icon: '📋' },
  ];

  useEffect(() => {
    if (!proposalId) {
      setError('No proposal ID found');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await apiClient.checkProposalStatus(proposalId);
        const status = response.data;

        if (status.status === 'ready') {
          setProgress(100);
          setCurrentStep(4);
          // Redirect to proposal after short delay
          setTimeout(() => {
            router.push(`/proposal/${proposalId}`);
          }, 1000);
        } else if (status.status === 'generating') {
          const newProgress = status.progress || Math.min(progress + 15, 85);
          setProgress(newProgress);
          setCurrentStep(Math.ceil((newProgress / 100) * messages.length));
        } else if (status.status === 'error') {
          setError(status.errorMessage || 'Failed to generate proposal');
        }
      } catch (err) {
        setError(apiClient.getErrorMessage(err));
      }
    };

    // Initial check
    checkStatus();

    // Poll every 1 second
    const interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, [proposalId, router, progress]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-red-900/20 border-red-500">
              <div className="text-center">
                <h2 className="font-bebas text-2xl text-red-400 tracking-wide mb-4">
                  Oops!
                </h2>
                <p className="text-red-300 mb-6">{error}</p>
                <button
                  onClick={() => window.location.href = '/get-quote'}
                  className="px-6 py-2 bg-sun text-dark-bg rounded-lg font-medium hover:bg-sun-dim transition-colors"
                >
                  Try Again
                </button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-4">
                Generating Your Proposal
              </h1>
              <p className="text-gray-400">
                This usually takes 60-120 seconds
              </p>
            </div>

            {/* Progress Bar */}
            <Card>
              <ProgressBar progress={progress} showLabel={true} />
            </Card>

            {/* Status Messages */}
            <Card className="space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentStep >= msg.step ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {currentStep > msg.step ? (
                      <span className="text-lg">✓</span>
                    ) : currentStep === msg.step ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sun" />
                    ) : (
                      <span className="text-lg opacity-30">{msg.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      currentStep >= msg.step
                        ? currentStep === msg.step
                          ? 'text-sun font-medium'
                          : 'text-green-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {msg.message}
                  </span>
                </motion.div>
              ))}
            </Card>

            {/* Loading indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing your information...</span>
              </div>
            </div>

            {/* Sunbull branding */}
            <div className="text-center">
              <p className="font-bebas text-2xl text-sun tracking-widest">
                SUNBULL AI
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProcessingPage;
