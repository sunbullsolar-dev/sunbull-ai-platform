'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface Deal {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  systemSize: number;
  panelCount: number;
  monthlyPayment: number;
  paymentType: string;
  status: string;
}

interface TimelineStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'upcoming';
  expectedDate: string;
  actualDate?: string;
}

export function useDashboard(dealId: string | null) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [timeline, setTimeline] = useState<TimelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!dealId) return;
    try {
      setLoading(true);
      const [dealResp, timelineResp] = await Promise.all([
        apiClient.getDeal(dealId),
        apiClient.getDealTimeline(dealId),
      ]);
      setDeal(dealResp.data);
      setTimeline(timelineResp.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    if (!dealId) {
      setLoading(false);
      return;
    }

    fetchData();

    // Poll every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [dealId, fetchData]);

  return { deal, timeline, loading, error, refetch: fetchData };
}
