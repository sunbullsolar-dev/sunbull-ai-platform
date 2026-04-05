/**
 * SaaS Billing Service
 * Manages subscriptions, invoices, and billing events via Stripe
 */

import logger from '../utils/logger';
// @ts-ignore - stripe module may not be available
import Stripe from 'stripe';
import {
  SaaSSubscription,
  PlanTier,
  SaasPlan,
  BillingEvent,
  SubscriptionStatus,
} from '../types/saas';
import Redis from 'ioredis';

export class SaasBillingService {
  private stripe: Stripe;

  /**
   * SaaS plan definitions with pricing and limits
   */
  readonly SAAS_PLANS: Record<PlanTier, SaasPlan> = {
    starter: {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for getting started',
      monthlyPrice: 3000, // $3000/month
      annualPrice: 33000, // $33000/year (10% discount)
      stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
      stripeAnnualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
      limits: {
        monthlyLeads: 200,
        monthlyDeals: 50,
        teamMembers: 3,
