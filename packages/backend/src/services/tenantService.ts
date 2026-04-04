/**
 * Tenant Service
 * Handles all tenant management operations including branding, limits, and usage
 */

import logger from '../utils/logger';
import { Tenant, BrandingConfig, UsageReport, SaaSSubscription } from '@sunbull/shared/src/types/saas';
import Redis from 'ioredis';

export class TenantService {
  private readonly TENANT_CACHE_TTL = 3600; // 1 hour
  private readonly USAGE_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly tenantRepository: any,
    private readonly subscriptionRepository: any,
    private readonly redis: Redis,
  ) {}

  /**
   * Get tenant by subdomain with caching
   */
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    const cacheKey = `tenant:subdomain:${subdomain}`;

    try {
      // Try cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for tenant: ${subdomain}`);
        return JSON.parse(cached);
      }

      // Query database
      const tenant = await this.tenantRepository.findOne({
        where: { subdomain, status: 'active' },
        relations: ['subscription'],
      });

      if (!tenant) {
        logger.warn(`Tenant not found: ${subdomain}`);
        return null;
      }

      // Cache the result
      await this.redis.setex(cacheKey, this.TENANT_CACHE_TTL, JSON.stringify(tenant));
      return tenant;
    } catch (error) {
      logger.error(`Error fetching tenant by subdomain: ${subdomain}`, error);
      throw new Error(`Failed to fetch tenant: ${(error as Error).message}`);
    }
  }

  /**
   * Get tenant by ID with caching
   */
  async getTenantById(tenantId: string): Promise<Tenant> {
    const cacheKey = `tenant:id:${tenantId}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
        relations: ['subscription'],
      });

      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      await this.redis.setex(cacheKey, this.TENANT_CACHE_TTL, JSON.stringify(tenant));
      return tenant;
    } catch (error) {
      logger.error(`Error fetching tenant by ID: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get tenant branding configuration
   */
  async getTenantBranding(tenantId: string): Promise<BrandingConfig> {
    const cacheKey = `tenant:branding:${tenantId}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const tenant = await this.getTenantById(tenantId);
      await this.redis.setex(cacheKey, this.TENANT_CACHE_TTL, JSON.stringify(tenant.branding));

      return tenant.branding;
    } catch (error) {
      logger.error(`Error fetching branding for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Create new SaaS tenant
   */
  async createTenant(data: {
    companyName: string;
    subdomain: string;
    domain: string;
    contactEmail: string;
    contactPhone: string;
    companyWebsite?: string;
    branding?: Partial<BrandingConfig>;
  }): Promise<Tenant> {
    try {
      // Validate subdomain uniqueness
      const existing = await this.tenantRepository.findOne({
        where: { subdomain: data.subdomain },
      });

      if (existing) {
        throw new Error(`Subdomain already in use: ${data.subdomain}`);
      }

      // Validate domain uniqueness
      const domainExists = await this.tenantRepository.findOne({
        where: { domain: data.domain },
      });

      if (domainExists) {
        throw new Error(`Domain already in use: ${data.domain}`);
      }

      // Create tenant with default branding
      const defaultBranding: BrandingConfig = {
        logoUrl: 'https://sunbull.ai/logo.png',
        primaryColor: '#FFB800',
        secondaryColor: '#1A1A1A',
        accentColor: '#FF6B00',
        fontFamily: 'Inter',
        companyName: data.companyName,
        tagline: 'Powered by Sunbull AI',
        ...data.branding,
      };

      const tenant = this.tenantRepository.create({
        companyName: data.companyName,
        subdomain: data.subdomain,
        domain: data.domain,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        companyWebsite: data.companyWebsite,
        branding: defaultBranding,
        status: 'active',
        installerSource: 'sunbull',
        useOwnInstallers: false,
      });

      const saved = await this.tenantRepository.save(tenant);
      logger.log(`Tenant created: ${saved.id}`);

      // Invalidate any related caches
      await this.invalidateTenantCache(saved.id);

      return saved;
    } catch (error) {
      logger.error('Error creating tenant', error);
      throw error;
    }
  }

  /**
   * Update tenant branding
   */
  async updateBranding(
    tenantId: string,
    branding: Partial<BrandingConfig>,
  ): Promise<BrandingConfig> {
    try {
      const tenant = await this.getTenantById(tenantId);

      // Merge with existing branding
      const updated = {
        ...tenant.branding,
        ...branding,
      };

      // Validate colors
      if (branding.primaryColor && !this.isValidHexColor(branding.primaryColor)) {
        throw new Error(`Invalid primary color: ${branding.primaryColor}`);
      }

      if (branding.secondaryColor && !this.isValidHexColor(branding.secondaryColor)) {
        throw new Error(`Invalid secondary color: ${branding.secondaryColor}`);
      }

      tenant.branding = updated;
      await this.tenantRepository.save(tenant);

      logger.log(`Branding updated for tenant: ${tenantId}`);

      // Invalidate branding cache
      await this.redis.del(`tenant:branding:${tenantId}`);
      await this.invalidateTenantCache(tenantId);

      return updated;
    } catch (error) {
      logger.error(`Error updating branding for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsageStats(tenantId: string): Promise<UsageReport> {
    const cacheKey = `tenant:usage:${tenantId}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const tenant = await this.getTenantById(tenantId);
      const subscription = tenant.subscription;

      if (!subscription) {
        throw new Error(`Tenant has no active subscription: ${tenantId}`);
      }

      const now = new Date();
      const periodStart = new Date(subscription.currentPeriodStart);
      const periodEnd = new Date(subscription.currentPeriodEnd);

      // Calculate usage percentages
      const leadPercentage = (subscription.leadUsage / subscription.leadLimit) * 100;
      const dealPercentage = (subscription.dealUsage / subscription.dealLimit) * 100;

      const usage: UsageReport = {
        tenantId,
        period: { start: periodStart, end: periodEnd },
        leads: {
          total: subscription.leadUsage,
          converted: Math.floor(subscription.leadUsage * 0.15), // 15% conversion assumption
          conversionRate: 0.15,
          cost: subscription.leadUsage * 5, // $5 per lead placeholder
        },
        deals: {
          total: subscription.dealUsage,
          won: Math.floor(subscription.dealUsage * 0.45), // 45% win rate assumption
          winRate: 0.45,
          totalValue: Math.floor(subscription.dealUsage * 15000), // $15k average deal
          averageValue: 15000,
        },
        revenue: {
          total: Math.floor(subscription.dealUsage * 15000 * 0.45),
          fromInstallers: 0,
          fromLeads: Math.floor(subscription.dealUsage * 15000 * 0.45),
        },
        usage: {
          leadUsage: subscription.leadUsage,
          leadLimit: subscription.leadLimit,
          dealUsage: subscription.dealUsage,
          dealLimit: subscription.dealLimit,
          percentageUsed: Math.max(leadPercentage, dealPercentage),
        },
      };

      // Cache usage stats
      await this.redis.setex(cacheKey, this.USAGE_CACHE_TTL, JSON.stringify(usage));

      return usage;
    } catch (error) {
      logger.error(`Error fetching usage stats for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Check if tenant has exceeded lead limit
   */
  async checkLeadLimit(tenantId: string): Promise<{
    exceeded: boolean;
    current: number;
    limit: number;
    percentageUsed: number;
  }> {
    try {
      const tenant = await this.getTenantById(tenantId);
      const subscription = tenant.subscription;

      if (!subscription) {
        throw new Error(`Tenant has no active subscription: ${tenantId}`);
      }

      const percentageUsed = (subscription.leadUsage / subscription.leadLimit) * 100;

      return {
        exceeded: subscription.leadUsage >= subscription.leadLimit,
        current: subscription.leadUsage,
        limit: subscription.leadLimit,
        percentageUsed,
      };
    } catch (error) {
      logger.error(`Error checking lead limit for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Check if tenant has exceeded deal limit
   */
  async checkDealLimit(tenantId: string): Promise<{
    exceeded: boolean;
    current: number;
    limit: number;
    percentageUsed: number;
  }> {
    try {
      const tenant = await this.getTenantById(tenantId);
      const subscription = tenant.subscription;

      if (!subscription) {
        throw new Error(`Tenant has no active subscription: ${tenantId}`);
      }

      const percentageUsed = (subscription.dealUsage / subscription.dealLimit) * 100;

      return {
        exceeded: subscription.dealUsage >= subscription.dealLimit,
        current: subscription.dealUsage,
        limit: subscription.dealLimit,
        percentageUsed,
      };
    } catch (error) {
      logger.error(`Error checking deal limit for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Increment lead usage counter
   */
  async incrementLeadUsage(tenantId: string, count: number = 1): Promise<void> {
    try {
      const tenant = await this.getTenantById(tenantId);
      const subscription = tenant.subscription;

      if (!subscription) {
        throw new Error(`Tenant has no active subscription: ${tenantId}`);
      }

      // Check limit before incrementing
      if (subscription.leadUsage + count > subscription.leadLimit) {
        logger.warn(`Lead limit exceeded for tenant: ${tenantId}`);
      }

      subscription.leadUsage += count;
      await this.subscriptionRepository.save(subscription);

      // Invalidate cache
      await this.redis.del(`tenant:usage:${tenantId}`);
      logger.debug(`Lead usage incremented for tenant: ${tenantId}`);
    } catch (error) {
      logger.error(`Error incrementing lead usage for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Increment deal usage counter
   */
  async incrementDealUsage(tenantId: string, count: number = 1): Promise<void> {
    try {
      const tenant = await this.getTenantById(tenantId);
      const subscription = tenant.subscription;

      if (!subscription) {
        throw new Error(`Tenant has no active subscription: ${tenantId}`);
      }

      subscription.dealUsage += count;
      await this.subscriptionRepository.save(subscription);

      // Invalidate cache
      await this.redis.del(`tenant:usage:${tenantId}`);
      logger.debug(`Deal usage incremented for tenant: ${tenantId}`);
    } catch (error) {
      logger.error(`Error incrementing deal usage for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get all tenants with pagination and filtering
   */
  async getAllTenants(filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<{ data: Tenant[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      let query = this.tenantRepository.createQueryBuilder('tenant');

      if (filters.status) {
        query = query.where('tenant.status = :status', { status: filters.status });
      }

      if (filters.search) {
        query = query.andWhere(
          '(tenant.companyName ILIKE :search OR tenant.domain ILIKE :search OR tenant.subdomain ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      if (filters.sort) {
        const [field, direction] = filters.sort.split(':');
        query = query.orderBy(`tenant.${field}`, direction?.toUpperCase() as 'ASC' | 'DESC' || 'ASC');
      } else {
        query = query.orderBy('tenant.createdAt', 'DESC');
      }

      const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

      return { data, total, page, limit };
    } catch (error) {
      logger.error('Error fetching all tenants', error);
      throw error;
    }
  }

  /**
   * Deactivate tenant (soft delete)
   */
  async deactivateTenant(tenantId: string, reason?: string): Promise<void> {
    try {
      const tenant = await this.getTenantById(tenantId);

      tenant.status = 'inactive';
      tenant.deactivatedAt = new Date();

      await this.tenantRepository.save(tenant);

      logger.log(`Tenant deactivated: ${tenantId} - Reason: ${reason || 'No reason provided'}`);

      // Invalidate all caches for this tenant
      await this.invalidateTenantCache(tenantId);
    } catch (error) {
      logger.error(`Error deactivating tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Reactivate a deactivated tenant
   */
  async reactivateTenant(tenantId: string): Promise<Tenant> {
    try {
      const tenant = await this.getTenantById(tenantId);

      tenant.status = 'active';
      tenant.deactivatedAt = undefined;

      const updated = await this.tenantRepository.save(tenant);

      logger.log(`Tenant reactivated: ${tenantId}`);

      // Invalidate cache
      await this.invalidateTenantCache(tenantId);

      return updated;
    } catch (error) {
      logger.error(`Error reactivating tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Suspend tenant for non-payment
   */
  async suspendTenant(tenantId: string, reason: string): Promise<void> {
    try {
      const tenant = await this.getTenantById(tenantId);

      tenant.status = 'suspended';

      await this.tenantRepository.save(tenant);

      logger.log(`Tenant suspended: ${tenantId} - Reason: ${reason}`);

      await this.invalidateTenantCache(tenantId);
    } catch (error) {
      logger.error(`Error suspending tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Check if tenant is over usage
   */
  async isOverUsage(tenantId: string): Promise<boolean> {
    try {
      const leadCheck = await this.checkLeadLimit(tenantId);
      const dealCheck = await this.checkDealLimit(tenantId);

      return leadCheck.exceeded || dealCheck.exceeded;
    } catch (error) {
      logger.error(`Error checking usage for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Invalidate all caches for a tenant
   */
  private async invalidateTenantCache(tenantId: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (tenant) {
      await this.redis.del(`tenant:id:${tenantId}`);
      await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
      await this.redis.del(`tenant:branding:${tenantId}`);
      await this.redis.del(`tenant:usage:${tenantId}`);
    }
  }

  /**
   * Validate hex color format
   */
  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}
