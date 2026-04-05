'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface Proposal {
  id: string;
  status: string;
  customerName: string;
  systemSize: number;
  panelCount: number;
  offsetPercentage: number;
  monthlyBill: number;
  monthlySavings: number;
  paymentOptions: PaymentOption[];
  address: string;
}

interface PaymentOption {
  id: string;
  type: 'lease' | 'finance' | 'cash';
  monthlyPayment: number;
  termYears: number;
  totalCost: number;
  savings25Year: number;
}

export function useProposal(proposalId: string | null) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!proposalId) return;
    try {
      const { data } = await apiClient.checkProposalStatus(proposalId);
      return data;
    } catch (err) {
      console.error('Error checking proposal status:', err);
      return null;
    }
  }, [proposalId]);

  useEffect(() => {
    if (!proposalId) {
      setLoading(false);
      return;
    }

    let intervalId: NodeJS.Timeout;

    const fetchProposal = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.getProposal(proposalId);
        setProposal(data);
        setError(null);

        if (data.status === 'generating') {
          intervalId = setInterval(async () => {
            const status = await checkStatus();
            if (status && status.status !== 'generating') {
              clearInterval(intervalId);
              const { data: updated } = await apiClient.getProposal(proposalId);
              setProposal(updated);
            }
          }, 1000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [proposalId, checkStatus]);

  return { proposal, loading, error, checkStatus };
}
