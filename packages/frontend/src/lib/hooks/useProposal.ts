'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface Proposal {
  id: string;
  status: string;
  homeownerName: string;
  systemKW: number;
  panelCount: number;
  offsetPercentage: number;
  currentMonthlyBill: number;
  utilityTotal: number;
  solarTotal: number;
  annualProduction: number;
  paybackPeriod: number;
  year25Total: number;
  monthlyAverage: number;
  proposalText: string;
  paymentOptions: PaymentOption[];
}

interface PaymentOption {
  id: string;
  type: 'lease' | 'finance' | 'cash';
  monthlyPayment: number;
  termYears: number;
  totalCost: number;
  savings25Year: number;
}

function mapProposal(data: any): Proposal {
  const roi = data.roi || {};
  const systemKW = Number(data.system_size ?? data.systemSize ?? 0);
  const annualProduction = Number(data.annual_production ?? data.annualProduction ?? 0);
  const monthlyAverage = Number(roi.monthlyAverage ?? 0);
  const year25Total = Number(roi.year25Total ?? 0);
  const paybackPeriod = Number(roi.paybackPeriod ?? 0);
  const panelCount = Math.max(1, Math.round(systemKW / 0.4));
  const currentMonthlyBill = Math.round(monthlyAverage);
  const utilityTotal = Math.round((monthlyAverage * 12 * 25) + year25Total);
  const solarTotal = Math.max(0, utilityTotal - year25Total);
  const homeownerName =
    data.homeownerName || data.first_name || data.lead?.first_name || 'Homeowner';
  return {
    id: data.id,
    status: data.status || 'draft',
    homeownerName,
    systemKW: Math.round(systemKW * 10) / 10,
    panelCount,
    offsetPercentage: 100,
    currentMonthlyBill,
    utilityTotal,
    solarTotal,
    annualProduction,
    paybackPeriod,
    year25Total,
    monthlyAverage,
    proposalText: data.proposal_text || data.proposalText || '',
    paymentOptions: data.payment_options || data.paymentOptions || [],
  };
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
        const { data: envelope } = await apiClient.getProposal(proposalId);
        const data = envelope?.data ?? envelope;
        setProposal(mapProposal(data));
        setError(null);

        if (data.status === 'generating') {
          intervalId = setInterval(async () => {
            const status = await checkStatus();
            if (status && status.status !== 'generating') {
              clearInterval(intervalId);
              const { data: updatedEnv } = await apiClient.getProposal(proposalId);
              setProposal(mapProposal(updatedEnv?.data ?? updatedEnv));
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
