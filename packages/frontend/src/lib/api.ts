import axios from 'axios';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
// Normalize so endpoints like /v1/leads resolve correctly regardless of
// whether NEXT_PUBLIC_API_URL was set with or without a trailing /api.
const _trimmed = RAW_API_URL.replace(/\/$/, '');
const API_URL = _trimmed.endsWith('/api') ? _trimmed : _trimmed + '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sunbull_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sunbull_token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Leads
  createLead: (data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    utilityProvider: string;
    monthlyBill: number;
    billUnit?: 'dollar' | 'kwh';
    billType?: 'dollar' | 'kwh';
    utilityBillFile?: File;
    tcpaConsent?: boolean;
  }) => {
    // Backend expects firstName/lastName separately and tcpaConsent.
    const trimmed = (data.fullName || '').trim();
    const parts = trimmed.split(/\s+/);
    const firstName = parts.shift() || trimmed;
    const lastName = parts.join(' ') || firstName;
    return api.post('/v1/leads', {
      firstName,
      lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      state: data.state,
      utilityProvider: data.utilityProvider,
      monthlyBill: data.monthlyBill,
      billUnit: data.billUnit ?? data.billType,
      tcpaConsent: data.tcpaConsent ?? true,
    });
  },

  // Tesla-style quick quote — address + bill only, no contact
  quickQuote: (data: {
    address: string;
    monthlyBill: number;
    billUnit: 'dollar' | 'kwh';
    utilityProvider?: string;
  }) =>
    api.post('/v1/leads', {
      address: data.address,
      monthlyBill: data.monthlyBill,
      billUnit: data.billUnit,
      utilityProvider: data.utilityProvider,
    }),

  // Contact + TCPA capture at the checkout/deposit step
  updateLeadContact: (
    leadId: string,
    data: {
      firstName: string;
      lastName?: string;
      email: string;
      phone: string;
      tcpaConsent: boolean;
    }
  ) => api.patch(`/v1/leads/${leadId}/contact`, data),

  // Proposals
  getProposal: (id: string) => api.get(`/v1/proposals/${id}`),
  checkProposalStatus: (id: string) => api.get(`/v1/proposals/${id}/status`),
  generateProposal: (leadId: string) => api.post('/v1/proposals/generate', { leadId }),

  // Checkout
  selectPaymentOption: (proposalId: string, optionId: string) =>
    api.post(`/v1/proposals/${proposalId}/select-payment`, { optionId }),
  scheduleInspection: (dealId: string, date: string, time: string) =>
    api.post(`/v1/deals/${dealId}/schedule-inspection`, { date, time }),

  // Dashboard
  getDeal: (id: string) => api.get(`/v1/deals/${id}`),
  getDealTimeline: (id: string) => api.get(`/v1/deals/${id}/timeline`),

  // Auth (magic link)
  requestMagicLink: (email: string) => api.post('/v1/auth/magic-link', { email }),
  verifyMagicLink: (token: string) => api.post('/v1/auth/verify', { token }),
};

export default apiClient;
