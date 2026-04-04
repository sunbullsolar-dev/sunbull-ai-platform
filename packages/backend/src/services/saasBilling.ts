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
} from '@sunbull/shared/src/types/saas';
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
        customDomain: false,
        advancedAnalytics: false,
        apiAccess: false,
        ssoIntegration: false,
        dedicatedSupport: false,
        priority: 'standard',
      },
      features: [
        'Up to 200 leads/month',
        'Lead scoring',
        'Basic CRM',
        'Email notifications',
        'Standard support',
      ],
    },
    growth: {
      id: 'growth',
      name: 'Growth',
      description: 'For growing solar companies',
      monthlyPrice: 8000, // $8000/month
      annualPrice: 88000, // $88000/year (10% discount)
      stripePriceId: process.env.STRIPE_PRICE_GROWTH_MONTHLY || 'price_growth_monthly',
      stripeAnnualPriceId: process.env.STRIPE_PRICE_GROWTH_ANNUAL || 'price_growth_annual',
      limits: {
        monthlyLeads: 1000,
        monthlyDeals: 250,
        teamMembers: 10,
        customDomain: true,
        advancedAnalytics: true,
        apiAccess: true,
        ssoIntegration: false,
        dedicatedSupport: false,
        priority: 'priority',
      },
      features: [
        'Up to 1000 leads/month',
        'Advanced lead scoring',
        'Full CRM',
        'Custom domain',
        'Advanced analytics',
        'API access',
        'Priority support',
      ],
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solution for large teams',
      monthlyPrice: 0, // Custom pricing
      annualPrice: 0, // Custom pricing
      stripePriceId: '',
      stripeAnnualPriceId: '',
      limits: {
        monthlyLeads: 10000,
        monthlyDeals: 2500,
        teamMembers: 100,
        customDomain: true,
        advancedAnalytics: true,
        apiAccess: true,
        ssoIntegration: true,
        dedicatedSupport: true,
        priority: 'dedicated',
      },
      features: [
        'Unlimited leads',
        'Unlimited deals',
        'Custom domain',
        'Advanced analytics & AI',
        'Full API access',
        'SSO integration',
        'Dedicated account manager',
        'Custom features',
      ],
    },
  };

  constructor(
    private readonly subscriptionRepository: any,
    private readonly billingEventRepository: any,
    private readonly tenantRepository: any,
    private readonly redis: Redis,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20',
    });
  }

  /**
   * Create a new subscription for a tenant
   */
  async createSubscription(
    tenantId: string,
    plan: PlanTier,
    customerId?: string,
  ): Promise<SaaSSubscription> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      const planConfig = this.SAAS_PLANS[plan];
      if (!planConfig) {
        throw new Error(`Invalid plan: ${plan}`);
      }

      // Create or use existing Stripe customer
      let customer: Stripe.Customer;

      if (customerId) {
        customer = await this.stripe.customers.retrieve(customerId);
      } else {
        customer = await this.stripe.customers.create({
          email: tenant.contactEmail,
          name: tenant.companyName,
          metadata: { tenantId },
        });
      }

      // Create Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: planConfig.stripePriceId,
          },
        ],
        metadata: { tenantId },
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
      });

      // Create subscription record
      const subscription = this.subscriptionRepository.create({
        tenantId,
        stripeSubscriptionId: stripeSubscription.id,
        plan,
        status: 'trialing' as SubscriptionStatus,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        leadUsage: 0,
        leadLimit: planConfig.limits.monthlyLeads,
        dealUsage: 0,
        dealLimit: planConfig.limits.monthlyDeals,
        cancelAtPeriodEnd: false,
      });

      const saved = await this.subscriptionRepository.save(subscription);

      // Log billing event
      await this.logBillingEvent(tenantId, 'subscription_created', {
        plan,
        monthlyPrice: planConfig.monthlyPrice,
        stripeSubscriptionId: stripeSubscription.id,
      });

      logger.log(`Subscription created for tenant: ${tenantId} (${plan})`);

      return saved;
    } catch (error) {
      logger.error(`Error creating subscription for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Update subscription to a different plan
   */
  async updateSubscription(tenantId: string, newPlan: PlanTier): Promise<SaaSSubscription> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { tenantId },
      });

      if (!subscription) {
        throw new Error(`Subscription not found for tenant: ${tenantId}`);
      }

      const currentPlan = this.SAAS_PLANS[subscription.plan as PlanTier];
      const newPlanConfig = this.SAAS_PLANS[newPlan];

      if (!newPlanConfig) {
        throw new Error(`Invalid plan: ${newPlan}`);
      }

      // Update Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      if (!stripeSubscription.items.data.length) {
        throw new Error('Invalid subscription structure');
      }

      // Update subscription item with new price
      await this.stripe.subscriptionItems.update(stripeSubscription.items.data[0].id, {
        price: newPlanConfig.stripePriceId,
        proration_behavior: 'create_prorations',
      });

      // Update subscription record
      subscription.plan = newPlan;
      subscription.leadLimit = newPlanConfig.limits.monthlyLeads;
      subscription.dealLimit = newPlanConfig.limits.monthlyDeals;

      const updated = await this.subscriptionRepository.save(subscription);

      // Log billing event
      await this.logBillingEvent(tenantId, 'subscription_updated', {
        from: subscription.plan,
        to: newPlan,
        priceChange: newPlanConfig.monthlyPrice - currentPlan.monthlyPrice,
      });

      logger.log(`Subscription updated for tenant: ${tenantId} (${newPlan})`);

      return updated;
    } catch (error) {
      logger.error(`Error updating subscription for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    tenantId: string,
    immediately: boolean = false,
  ): Promise<SaaSSubscription> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { tenantId },
      });

      if (!subscription) {
        throw new Error(`Subscription not found for tenant: ${tenantId}`);
      }

      // Cancel Stripe subscription
      const canceledStripeSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: !immediately,
        },
      );

      // Update subscription record
      subscription.status = 'canceled' as SubscriptionStatus;
      subscription.cancelAtPeriodEnd = !immediately;

      if (immediately) {
        subscription.currentPeriodEnd = new Date();
      }

      const updated = await this.subscriptionRepository.save(subscription);

      // Log billing event
      await this.logBillingEvent(tenantId, 'subscription_canceled', {
        immediately,
        canceledAt: new Date(),
      });

      logger.log(
        `Subscription canceled for tenant: ${tenantId} (immediately: ${immediately})`,
      );

      return updated;
    } catch (error) {
      logger.error(`Error canceling subscription for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get invoices for a tenant
   */
  async getInvoices(
    tenantId: string,
    limit: number = 12,
  ): Promise<Array<{ id: string; amount: number; status: string; dueDate: Date; url: string }>> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { tenantId },
      });

      if (!subscription) {
        throw new Error(`Subscription not found for tenant: ${tenantId}`);
      }

      const stripeInvoices = await this.stripe.invoices.list({
        subscription: subscription.stripeSubscriptionId,
        limit,
      });

      return stripeInvoices.data.map((invoice: any) => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        status: invoice.status || 'unknown',
        dueDate: new Date(invoice.due_date ? invoice.due_date * 1000 : 0),
        url: invoice.hosted_invoice_url || '',
      }));
    } catch (error) {
      logger.error(`Error fetching invoices for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdated(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionDeleted(subscription);
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaid(invoice);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaymentFailed(invoice);
          break;
        }

        default:
          logger.debug(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error handling Stripe webhook', error);
      throw error;
    }
  }

  /**
   * Check if tenant is over lead limit and send warning
   */
  async checkOverage(tenantId: string): Promise<{ overLimit: boolean; percentage: number }> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { tenantId },
      });

      if (!subscription) {
        throw new Error(`Subscription not found for tenant: ${tenantId}`);
      }

      const leadPercentage = (subscription.leadUsage / subscription.leadLimit) * 100;
      const dealPercentage = (subscription.dealUsage / subscription.dealLimit) * 100;
      const percentage = Math.max(leadPercentage, dealPercentage);

      // Send warning if over 80%
      if (percentage > 80) {
        await this.logBillingEvent(tenantId, 'overage_warning', {
          leadUsage: subscription.leadUsage,
          leadLimit: subscription.leadLimit,
          dealUsage: subscription.dealUsage,
          dealLimit: subscription.dealLimit,
          percentage,
        });

        logger.warn(`Overage warning for tenant: ${tenantId} (${percentage.toFixed(2)}%)`);
      }

      return { overLimit: percentage > 100, percentage };
    } catch (error) {
      logger.error(`Error checking overage for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get plan configuration
   */
  getPlanConfig(plan: PlanTier): SaasPlan {
    const config = this.SAAS_PLANS[plan];
    if (!config) {
      throw new Error(`Invalid plan: ${plan}`);
    }
    return config;
  }

  /**
   * Get all plans
   */
  getAllPlans(): SaasPlan[] {
    return Object.values(this.SAAS_PLANS);
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    try {
      return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      logger.error('Webhook signature verification failed', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Private: Log billing event
   */
  private async logBillingEvent(
    tenantId: string,
    type: BillingEvent['type'],
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const event = this.billingEventRepository.create({
        tenantId,
        type,
        description: JSON.stringify(data),
      });

      await this.billingEventRepository.save(event);
    } catch (error) {
      logger.error(`Error logging billing event for tenant: ${tenantId}`, error);
    }
  }

  /**
   * Private: Handle Stripe subscription updated
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const tenantId = stripeSubscription.metadata?.tenantId;

    if (!tenantId) {
      logger.warn('Subscription update webhook missing tenantId');
      return;
    }

    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { tenantId },
      });

      if (!subscription) {
        return;
      }

      // Update status based on Stripe subscription status
      subscription.status = (stripeSubscription.status as SubscriptionStatus) || 'active';
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

      await this.subscriptionRepository.save(subscription);

      // Invalidate cache
      await this.redis.del(`tenant:subscription:${tenantId}`);

      logger.log(`Subscription updated via webhook: ${tenantId}`);
    } catch (error) {
      logger.error(`Error handling subscription update webhook for ${tenantId}`, error);
    }
  }

  /**
   * Private: Handle Stripe subscription deleted
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const tenantId = stripeSubscription.metadata?.tenantId;

    if (!tenantId) {
      logger.warn('Subscription deletion webhook missing tenantId');
      return;
    }

    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { tenantId },
      });

      if (subscription) {
        subscription.status = 'canceled' as SubscriptionStatus;
        await this.subscriptionRepository.save(subscription);
        await this.redis.del(`tenant:subscription:${tenantId}`);
      }

      logger.log(`Subscription deleted via webhook: ${tenantId}`);
    } catch (error) {
      logger.error(`Error handling subscription deletion webhook for ${tenantId}`, error);
    }
  }

  /**
   * Private: Handle invoice paid
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = invoice.metadata?.tenantId;

    if (!tenantId) {
      logger.warn('Invoice paid webhook missing tenantId');
      return;
    }

    try {
      await this.logBillingEvent(tenantId, 'invoice_paid', {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        paidAt: new Date(invoice.paid * 1000),
      });

      logger.log(`Invoice paid via webhook: ${tenantId}`);
    } catch (error) {
      logger.error(`Error handling invoice paid webhook for ${tenantId}`, error);
    }
  }

  /**
   * Private: Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = invoice.metadata?.tenantId;

    if (!tenantId) {
      logger.warn('Invoice payment failed webhook missing tenantId');
      return;
    }

    try {
      await this.logBillingEvent(tenantId, 'invoice_failed', {
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        nextRetry: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
      });

      logger.log(`Invoice payment failed via webhook: ${tenantId}`);
    } catch (error) {
      logger.error(`Error handling invoice payment failed webhook for ${tenantId}`, error);
    }
  }
}
