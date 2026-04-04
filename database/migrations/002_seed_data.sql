-- Sunbull AI Platform - Seed Data
-- Created: 2026-04-03
-- Description: Initial data for tenants, installers, utility rates, and admin users

-- =============================================================================
-- TENANTS
-- =============================================================================

-- Sunbull AI - Internal B2C tenant
INSERT INTO tenants (
  id,
  company_name,
  domain,
  subdomain,
  branding,
  plan,
  monthly_fee,
  lead_limit,
  uses_own_installers,
  onboarding_complete,
  active
) VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Sunbull AI',
  'sunbull.com',
  'app',
  '{"logo_url": "https://cdn.sunbull.com/logo.png", "primary_color": "#FDB913", "secondary_color": "#003366", "font": "Inter"}'::JSONB,
  'enterprise',
  0.00,
  NULL,
  true,
  true,
  true
);

-- =============================================================================
-- INSTALLERS (Chatsworth Solar - Primary)
-- =============================================================================

INSERT INTO installers (
  id,
  tenant_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  address,
  city,
  state,
  zip,
  license_number,
  license_verified,
  license_verified_at,
  nabcep_certified,
  osha_certified,
  years_in_business,
  established_year,
  nps_score,
  permit_pull_rate,
  avg_install_days,
  workmanship_warranty_years,
  status,
  service_areas,
  capacity_per_month,
  photo_url
) VALUES (
  '10000000-0000-0000-0000-000000000001'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Chatsworth Solar & Electrical',
  'James Patterson',
  'james@chatsworthsolar.com',
  '(818) 555-0100',
  '8919 S Santa Fe Ave',
  'Chatsworth',
  'CA',
  '91311',
  'C10-123456-LIC',
  true,
  '2025-06-15 10:30:00+00',
  true,
  true,
  30,
  1994,
  8.7,
  0.85,
  7.5,
  10,
  'active',
  '["91311", "91316", "91325", "91326", "90650", "90638", "90601"]'::JSONB,
  15,
  'https://cdn.sunbull.com/installers/chatsworth-solar.jpg'
);

-- =============================================================================
-- ADDITIONAL INSTALLERS (Regional Coverage)
-- =============================================================================

-- Texas installer
INSERT INTO installers (
  id,
  tenant_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  address,
  city,
  state,
  zip,
  license_number,
  license_verified,
  license_verified_at,
  nabcep_certified,
  osha_certified,
  years_in_business,
  established_year,
  nps_score,
  permit_pull_rate,
  avg_install_days,
  workmanship_warranty_years,
  status,
  service_areas,
  capacity_per_month,
  photo_url
) VALUES (
  '10000000-0000-0000-0000-000000000002'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Lone Star Solar Solutions',
  'Robert Martinez',
  'robert@lonestarolar.com',
  '(512) 555-0200',
  '1234 Solar Parkway',
  'Austin',
  'TX',
  '78704',
  'TX-2024001-LIC',
  true,
  '2025-07-01 14:00:00+00',
  true,
  true,
  18,
  2006,
  8.4,
  0.80,
  8.0,
  10,
  'active',
  '["78704", "78702", "78701", "78703", "78721", "78722"]'::JSONB,
  12,
  'https://cdn.sunbull.com/installers/lone-star-solar.jpg'
);

-- Florida installer
INSERT INTO installers (
  id,
  tenant_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  address,
  city,
  state,
  zip,
  license_number,
  license_verified,
  license_verified_at,
  nabcep_certified,
  osha_certified,
  years_in_business,
  established_year,
  nps_score,
  permit_pull_rate,
  avg_install_days,
  workmanship_warranty_years,
  status,
  service_areas,
  capacity_per_month,
  photo_url
) VALUES (
  '10000000-0000-0000-0000-000000000003'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Sunshine Coast Solar',
  'Maria Rodriguez',
  'maria@sunshinecoastsolar.com',
  '(954) 555-0300',
  '2500 Solar Drive',
  'Miami',
  'FL',
  '33139',
  'FL-2025-00123',
  true,
  '2025-06-20 09:15:00+00',
  true,
  false,
  12,
  2012,
  8.2,
  0.75,
  8.5,
  10,
  'active',
  '["33139", "33140", "33127", "33128", "33138", "33150"]'::JSONB,
  10,
  'https://cdn.sunbull.com/installers/sunshine-coast-solar.jpg'
);

-- Arizona installer
INSERT INTO installers (
  id,
  tenant_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  address,
  city,
  state,
  zip,
  license_number,
  license_verified,
  license_verified_at,
  nabcep_certified,
  osha_certified,
  years_in_business,
  established_year,
  nps_score,
  permit_pull_rate,
  avg_install_days,
  workmanship_warranty_years,
  status,
  service_areas,
  capacity_per_month,
  photo_url
) VALUES (
  '10000000-0000-0000-0000-000000000004'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Desert Solar Innovations',
  'David Thompson',
  'david@desertsolar.com',
  '(602) 555-0400',
  '5500 Desert Wind Way',
  'Phoenix',
  'AZ',
  '85016',
  'AZ-2024-5566',
  true,
  '2025-05-10 11:45:00+00',
  true,
  true,
  22,
  2002,
  8.8,
  0.88,
  6.5,
  12,
  'active',
  '["85016", "85018", "85019", "85020", "85021", "85022"]'::JSONB,
  18,
  'https://cdn.sunbull.com/installers/desert-solar.jpg'
);

-- =============================================================================
-- USERS (Admin)
-- =============================================================================

-- Sunbull AI Admin User
INSERT INTO users (
  id,
  email,
  role,
  tenant_id,
  full_name,
  phone,
  auth0_id,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000001'::UUID,
  'admin@sunbull.com',
  'saas_admin',
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Sunbull Admin',
  '(800) 555-SOLAR',
  'auth0|admin-sunbull',
  NOW()
);

-- Operations user
INSERT INTO users (
  id,
  email,
  role,
  tenant_id,
  full_name,
  phone,
  auth0_id,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000002'::UUID,
  'ops@sunbull.com',
  'ops',
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Operations Manager',
  '(800) 555-0001',
  'auth0|ops-sunbull',
  NOW()
);

-- =============================================================================
-- UTILITY RATES (California - Primary)
-- =============================================================================

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000001'::UUID,
  'Pacific Gas and Electric',
  'CA',
  'E-1',
  0.16850,
  '{"tier_1": 0.15640, "tier_2": 0.19020, "tier_3": 0.23880}'::JSONB,
  'NEM3.0',
  0.09800,
  '2026-01-01',
  'OpenEI',
  NOW()
);

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000002'::UUID,
  'Southern California Edison',
  'CA',
  'TOU-D-PRIME',
  0.17840,
  '{"on_peak": 0.22560, "off_peak": 0.11240}'::JSONB,
  'NEM3.0',
  0.08900,
  '2026-01-01',
  'OpenEI',
  NOW()
);

-- =============================================================================
-- UTILITY RATES (Texas)
-- =============================================================================

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000003'::UUID,
  'Austin Energy',
  'TX',
  'Residential',
  0.12340,
  '{"tier_1": 0.11500, "tier_2": 0.13200}'::JSONB,
  'NEM2.0',
  0.12340,
  '2026-01-01',
  'OpenEI',
  NOW()
);

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000004'::UUID,
  'Oncor Electric Delivery',
  'TX',
  'Residential Service',
  0.11560,
  '{"base_rate": 0.11560}'::JSONB,
  'NEM2.0',
  0.11560,
  '2026-01-01',
  'OpenEI',
  NOW()
);

-- =============================================================================
-- UTILITY RATES (Florida)
-- =============================================================================

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000005'::UUID,
  'Florida Power & Light',
  'FL',
  'Residential',
  0.14230,
  '{"base_rate": 0.14230}'::JSONB,
  'None',
  0.00000,
  '2026-01-01',
  'OpenEI',
  NOW()
);

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000006'::UUID,
  'Duke Energy Florida',
  'FL',
  'Residential',
  0.13560,
  '{"base_rate": 0.13560}'::JSONB,
  'None',
  0.00000,
  '2026-01-01',
  'OpenEI',
  NOW()
);

-- =============================================================================
-- UTILITY RATES (Arizona)
-- =============================================================================

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000007'::UUID,
  'Arizona Public Service',
  'AZ',
  'Residential',
  0.14890,
  '{"tier_1": 0.13540, "tier_2": 0.17280}'::JSONB,
  'NEM3.0',
  0.09200,
  '2026-01-01',
  'OpenEI',
  NOW()
);

INSERT INTO utility_rates (
  id,
  utility_name,
  state,
  rate_schedule,
  residential_rate,
  tier_rates,
  nem_version,
  export_rate,
  effective_date,
  source,
  fetched_at
) VALUES (
  '30000000-0000-0000-0000-000000000008'::UUID,
  'Salt River Project',
  'AZ',
  'Residential',
  0.14560,
  '{"on_peak": 0.17890, "off_peak": 0.12340}'::JSONB,
  'NEM3.0',
  0.08900,
  '2026-01-01',
  'OpenEI',
  NOW()
);

-- =============================================================================
-- SAMPLE DATA COMMENTS
-- =============================================================================
-- The following can be used to populate test data:
--
-- INSERT INTO reps (
--   tenant_id, full_name, email, phone, rep_type,
--   handoff_link_code, active
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001'::UUID,
--   'John Smith',
--   'john@sunbull.com',
--   '(555) 123-4567',
--   'call_center',
--   'CODE_JS_001',
--   true
-- );
--
-- To create leads, use the application layer with proper validation.
-- This ensures TCPA compliance and proper consent tracking.
