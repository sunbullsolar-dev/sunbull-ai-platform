/**
 * Tenant Service
 * Handles all tenant management operations including branding, limits, and usage
 */

import logger from '../utils/logger';
import { Tenant, BrandingConfig, UsageReport, SaaSSubscription } from '../types/saas';
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
