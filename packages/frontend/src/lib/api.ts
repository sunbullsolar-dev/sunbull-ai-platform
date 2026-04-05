import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
    billType?: 'dollar' | 'kwh';
  }) => api.post('/v1/leads', data),

  // Proposals
  getProposal: (id: string) => api.get(`/v1/proposals/${id}`),
  checkProposalStatus: (id: string) => api.get(`/v1/proposals/${id}/status`),

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
