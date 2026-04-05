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
      monthlyPrice: 3000,
      annualPrice: 33000,
      stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
      stripeAnnualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
      limits: { monthlyLeads: 200, monthlyDeals: 50, teamMembers: 3, customDomain: false, advancedAnalytics: false, apiAccess: false, ssoIntegration: false, dedicatedSupport: false, priority: 'standard' },
      features: ['Up to 200 leads/month', 'Lead scoring', 'Basic CRM', 'Email notifications', 'Standard support'],
    },
    growth: {
      id: 'growth',
      name: 'Growth',
      description: 'For growing solar companies',
      monthlyPrice: 8000,
      annualPrice: 88000,
      stripePriceId: process.env.STRIPE_PRICE_GROWTH_MONTHLY || 'price_growth_monthly',
      stripeAnnualPriceId: process.env.STRIPE_PRICE_GROWTH_ANNUAL || 'price_growth_annual',
      limits: { monthlyLeads: 1000, monthlyDeals: 250, teamMembers: 10, customDomain: true, advancedAnalytics: true, apiAccess: true, ssoIntegration: false, dedicatedSupport: false, priority: 'priority' },
      features: ['Up to 1000 leads/month', 'Advanced lead scoring', 'Full CRM', 'Custom domain', 'Advanced analytics', 'API access', 'Priority support'],
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solution for large teams',
      monthlyPrice: 0,
      annualPrice: 0,
      stripePriceId: '',
      stripeAnnualPriceId: '',
      limits: { monthlyLeads: 10000, monthlyDeals: 2500, teamMembers: 100, customDomain: true, advancedAnalytics: true, apiAccess: true, ssoIntegration: true, dedicatedSupport: true, priority: 'dedicated' },
      features: ['Unlimited leads', 'Unlimited deals', 'Custom domain', 'Advanced analytics & AI', 'Full API access', 'SSO integration', 'Dedicated account manager', 'Custom features'],
    },
  };

  constructor(
    private readonly subscriptionRepository: any,
    private readonly billingEventRepository: any,
    private readonly tenantRepository: any,
    private readonly redis: Redis,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
  }

  async createSubscription(tenantId: string, plan: PlanTier, customerId?: string): Promise<SaaSSubscription> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
      if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);
      const planConfig = this.SAAS_PLANS[plan];
      if (!planConfig) throw new Error(`Invalid plan: ${plan}`);
      let customer: Stripe.Customer;
      if (customerId) { customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer; }
      else { customer = await this.stripe.customers.create({ email: tenant.contactEmail, name: tenant.companyName, metadata: { tenantId } }); }
      const stripeSub = await this.stripe.subscriptions.create({ customer: customer.id, items: [{ price: planConfig.stripePriceId }], metadata: { tenantId }, payment_behavior: 'default_incomplete', payment_settings: { save_default_payment_method: 'on_subscription' } });
      const subscription = this.subscriptionRepository.create({ tenantId, stripeSubscriptionId: stripeSub.id, plan, status: 'trialing' as SubscriptionStatus, currentPeriodStart: new Date(stripeSub.current_period_start * 1000), currentPeriodEnd: new Date(stripeSub.current_period_end * 1000), leadUsage: 0, leadLimit: planConfig.limits.monthlyLeads, dealUsage: 0, dealLimit: planConfig.limits.monthlyDeals, cancelAtPeriodEnd: false });
      const saved = await this.subscriptionRepository.save(subscription);
      await this.logBillingEvent(tenantId, 'subscription_created', { plan, monthlyPrice: planConfig.monthlyPrice, stripeSubscriptionId: stripeSub.id });
      logger.log(`Subscription created for tenant: ${tenantId} (${plan})`);
      return saved;
    } catch (error) { logger.error(`Error creating subscription: ${tenantId}`, error); throw error; }
  }

  async updateSubscription(tenantId: string, newPlan: PlanTier): Promise<SaaSSubscription> {
    try {
      const subscription = await this.subscriptionRepository.findOne({ where: { tenantId } });
      if (!subscription) throw new Error(`Subscription not found: ${tenantId}`);
      const currentPlan = this.SAAS_PLANS[subscription.plan as PlanTier];
      const newPlanConfig = this.SAAS_PLANS[newPlan];
      if (!newPlanConfig) throw new Error(`Invalid plan: ${newPlan}`);
      const stripeSub = await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      if (!stripeSub.items.data.length) throw new Error('Invalid subscription structure');
      await this.stripe.subscriptionItems.update(stripeSub.items.data[0].id, { price: newPlanConfig.stripePriceId, proration_behavior: 'create_prorations' });
      subscription.plan = newPlan;
      subscription.leadLimit = newPlanConfig.limits.monthlyLeads;
      subscription.dealLimit = newPlanConfig.limits.monthlyDeals;
      const updated = await this.subscriptionRepository.save(subscription);
      await this.logBillingEvent(tenantId, 'subscription_updated', { from: subscription.plan, to: newPlan, priceChange: newPlanConfig.monthlyPrice - currentPlan.monthlyPrice });
      logger.log(`Subscription updated: ${tenantId} (${newPlan})`);
      return updated;
    } catch (error) { logger.error(`Error updating subscription: ${tenantId}`, error); throw error; }
  }

  async cancelSubscription(tenantId: string, immediately: boolean = false): Promise<SaaSSubscription> {
    try {
      const subscription = await this.subscriptionRepository.findOne({ where: { tenantId } });
      if (!subscription) throw new Error(`Subscription not found: ${tenantId}`);
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: !immediately });
      subscription.status = 'canceled' as SubscriptionStatus;
      subscription.cancelAtPeriodEnd = !immediately;
      if (immediately) subscription.currentPeriodEnd = new Date();
      const updated = await this.subscriptionRepository.save(subscription);
      await this.logBillingEvent(tenantId, 'subscription_canceled', { immediately, canceledAt: new Date() });
      logger.log(`Subscription canceled: ${tenantId} (immediately: ${immediately})`);
      return updated;
    } catch (error) { logger.error(`Error canceling subscription: ${tenantId}`, error); throw error; }
  }

  async getInvoices(tenantId: string, limit: number = 12): Promise<Array<{ id: string; amount: number; status: string; dueDate: Date; url: string }>> {
    try {
      const subscription = await this.subscriptionRepository.findOne({ where: { tenantId } });
      if (!subscription) throw new Error(`Subscription not found: ${tenantId}`);
      const stripeInvoices = await this.stripe.invoices.list({ subscription: subscription.stripeSubscriptionId, limit });
      return stripeInvoices.data.map((invoice: any) => ({ id: invoice.id, amount: invoice.amount_paid, status: invoice.status || 'unknown', dueDate: new Date(invoice.due_date ? invoice.due_date * 1000 : 0), url: invoice.hosted_invoice_url || '' }));
    } catch (error) { logger.error(`Error fetching invoices: ${tenantId}`, error); throw error; }
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated': { await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription); break; }
        case 'customer.subscription.deleted': { await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription); break; }
        case 'invoice.paid': { await this.handleInvoicePaid(event.data.object as Stripe.Invoice); break; }
        case 'invoice.payment_failed': { await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice); break; }
        default: logger.debug(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) { logger.error('Error handling Stripe webhook', error); throw error; }
  }

  async checkOverage(tenantId: string): Promise<{ overLimit: boolean; percentage: number }> {
    try {
      const subscription = await this.subscriptionRepository.findOne({ where: { tenantId } });
      if (!subscription) throw new Error(`Subscription not found: ${tenantId}`);
      const leadPct = (subscription.leadUsage / subscription.leadLimit) * 100;
      const dealPct = (subscription.dealUsage / subscription.dealLimit) * 100;
      const percentage = Math.max(leadPct, dealPct);
      if (percentage > 80) {
        await this.logBillingEvent(tenantId, 'overage_warning', { leadUsage: subscription.leadUsage, leadLimit: subscription.leadLimit, dealUsage: subscription.dealUsage, dealLimit: subscription.dealLimit, percentage });
        logger.warn(`Overage warning: ${tenantId} (${percentage.toFixed(2)}%)`);
      }
      return { overLimit: percentage > 100, percentage };
    } catch (error) { logger.error(`Error checking overage: ${tenantId}`, error); throw error; }
  }

  getPlanConfig(plan: PlanTier): SaasPlan { const c = this.SAAS_PLANS[plan]; if (!c) throw new Error(`Invalid plan: ${plan}`); return c; }
  getAllPlans(): SaasPlan[] { return Object.values(this.SAAS_PLANS); }

  verifyWebhookSignature(body: string, signature: string): Stripe.Event {
    try { return this.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || ''); }
    catch (error) { logger.error('Webhook signature verification failed', error); throw new Error('Invalid webhook signature'); }
  }

  private async logBillingEvent(tenantId: string, type: BillingEvent['type'], data: Record<string, unknown>): Promise<void> {
    try { const evt = this.billingEventRepository.create({ tenantId, type, description: JSON.stringify(data) }); await this.billingEventRepository.save(evt); }
    catch (error) { logger.error(`Error logging billing event: ${tenantId}`, error); }
  }

  private async handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void> {
    const tenantId = stripeSub.metadata?.tenantId;
    if (!tenantId) { logger.warn('Subscription update webhook missing tenantId'); return; }
    try {
      const subscription = await this.subscriptionRepository.findOne({ where: { tenantId } });
      if (!subscription) return;
      subscription.status = (stripeSub.status as SubscriptionStatus) || 'active';
      subscription.currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
      await this.subscriptionRepository.save(subscription);
      await this.redis.del(`tenant:subscription:${tenantId}`);
      logger.log(`Subscription updated via webhook: ${tenantId}`);
    } catch (error) { logger.error(`Error handling subscription update webhook: ${tenantId}`, error); }
  }

  private async handleSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
    const tenantId = stripeSub.metadata?.tenantId;
    if (!tenantId) { logger.warn('Subscription deletion webhook missing tenantId'); return; }
    try {
      const subscription = await this.subscriptionRepository.findOne({ where: { tenantId } });
      if (subscription) { subscription.status = 'canceled' as SubscriptionStatus; await this.subscriptionRepository.save(subscription); await this.redis.del(`tenant:subscription:${tenantId}`); }
      logger.log(`Subscription deleted via webhook: ${tenantId}`);
    } catch (error) { logger.error(`Error handling subscription deletion webhook: ${tenantId}`, error); }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = invoice.metadata?.tenantId;
    if (!tenantId) { logger.warn('Invoice paid webhook missing tenantId'); return; }
    try {
      await this.logBillingEvent(tenantId, 'invoice_paid', { invoiceId: invoice.id, amount: invoice.amount_paid });
      logger.log(`Invoice paid via webhook: ${tenantId}`);
    } catch (error) { logger.error(`Error handling invoice paid webhook: ${tenantId}`, error); }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = invoice.metadata?.tenantId;
    if (!tenantId) { logger.warn('Invoice payment failed webhook missing tenantId'); return; }
    try {
      await this.logBillingEvent(tenantId, 'invoice_failed', { invoiceId: invoice.id, amount: invoice.amount_due });
      logger.log(`Invoice payment failed via webhook: ${tenantId}`);
    } catch (error) { logger.error(`Error handling invoice payment failed webhook: ${tenantId}`, error); }
  }
}
