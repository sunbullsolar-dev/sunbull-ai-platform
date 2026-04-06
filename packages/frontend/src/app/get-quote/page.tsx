'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

// Google Places loader — reuses the same key the backend uses for Solar/Geocoding
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

declare global {
  interface Window {
    google?: any;
    __sunbullPlacesLoading__?: Promise<void>;
  }
}

function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__sunbullPlacesLoading__) return window.__sunbullPlacesLoading__;
  if (!GOOGLE_MAPS_KEY) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_KEY is not set'));
  }
  window.__sunbullPlacesLoading__ = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&v=weekly`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(s);
  });
  return window.__sunbullPlacesLoading__;
}

const GetQuotePage: React.FC = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState('');
  const [billUnit, setBillUnit] = useState<'dollar' | 'kwh'>('dollar');
  const [billAmount, setBillAmount] = useState<number>(200);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        if (!inputRef.current || !window.google?.maps?.places) return;
        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: ['us'] },
          fields: ['formatted_address', 'geometry', 'address_components'],
        });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place?.formatted_address) {
            setAddress(place.formatted_address);
          }
        });
        setPlacesReady(true);
      })
      .catch((e) => {
        // still usable as plain text field
        console.warn('Places autocomplete unavailable:', e?.message);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address || address.length < 8) {
      setError('Please enter your home address.');
      return;
    }
    if (!billAmount || billAmount < 10) {
      setError(billUnit === 'dollar' ? 'Please enter a monthly bill amount.' : 'Please enter your monthly kWh usage.');
      return;
    }
    setSubmitting(true);
    try {
      const leadResp = await apiClient.quickQuote({
        address,
        monthlyBill: billAmount,
        billUnit,
      });
      const leadId = leadResp.data?.data?.id || leadResp.data?.id;
      if (!leadId) throw new Error('Quote not created');

      const genResp = await apiClient.generateProposal(leadId);
      const proposalId =
        genResp.data?.data?.id || genResp.data?.data?.proposalId || genResp.data?.id;
      if (!proposalId) throw new Error('Proposal not generated');

      router.push(`/proposal/${proposalId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center py-12">
      <div className="max-w-xl w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-3">
              DESIGN YOUR SOLAR SYSTEM
            </h1>
            <p className="text-gray-400">
              Enter your home address and average electricity bill to get a quote
              and view your savings.
            </p>
          </div>

          <Card className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Address
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Start typing your address…"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sun"
                  autoComplete="off"
                />
                {!placesReady && GOOGLE_MAPS_KEY && (
                  <p className="mt-1 text-xs text-gray-500">Loading address autocomplete…</p>
                )}
                {!GOOGLE_MAPS_KEY && (
                  <p className="mt-1 text-xs text-yellow-500">
                    Address autocomplete disabled (NEXT_PUBLIC_GOOGLE_MAPS_KEY not set).
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {billUnit === 'dollar' ? 'Average Electric Bill' : 'Average Monthly Consumption'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setBillUnit(billUnit === 'dollar' ? 'kwh' : 'dollar')}
                    className="text-xs text-sun underline"
                  >
                    {billUnit === 'dollar'
                      ? 'Know your average monthly consumption? Enter your kWh'
                      : 'Know your average monthly bill? Enter your bill amount'}
                  </button>
                </div>
                <div className="relative">
                  {billUnit === 'dollar' && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  )}
                  <input
                    type="number"
                    min={0}
                    step={billUnit === 'dollar' ? 5 : 50}
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    className={`w-full py-3 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sun ${
                      billUnit === 'dollar' ? 'pl-8 pr-16' : 'px-4 pr-20'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {billUnit === 'dollar' ? '/mo' : 'kWh /mo'}
                  </span>
                </div>
              </div>

              <Button fullWidth size="lg" type="submit" isLoading={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Designing your system…
                  </span>
                ) : (
                  'See System Recommendation'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                No contact info required. See your design, savings, and financing options first.
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GetQuotePage;
