-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) NOT NULL UNIQUE,
  brand_color VARCHAR(7) DEFAULT '#4CAF50',
  logo TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'sales_rep',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  tcpa_consent BOOLEAN DEFAULT FALSE,
  tcpa_consent_date TIMESTAMP,
  estimated_system_size FLOAT,
  roof_condition VARCHAR(100),
  utility VARCHAR(100),
  estimated_annual_usage FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_email (tenant_id, email),
  INDEX idx_tenant_status (tenant_id, status)
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  status VARCHAR(50) DEFAULT 'draft',
  roof_analysis JSONB,
  system_size FLOAT NOT NULL,
  annual_production FLOAT NOT NULL,
  payment_options JSONB,
  roi JSONB,
  proposal_text TEXT,
  viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_lead (tenant_id, lead_id),
  INDEX idx_tenant_status (tenant_id, status)
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  stage VARCHAR(50) DEFAULT 'proposal_selected',
  selected_payment_option JSONB,
  installer_id UUID,
  inspection_date TIMESTAMP,
  installation_date TIMESTAMP,
  system_size FLOAT NOT NULL,
  system_cost FLOAT NOT NULL,
  docusign_envelope_id VARCHAR(255),
  docusign_status VARCHAR(50),
  lender_approval_amount FLOAT,
  payment_status VARCHAR(50),
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant_lead (tenant_id, lead_id),
  INDEX idx_tenant_stage (tenant_id, stage)
);

-- Installers table
CREATE TABLE IF NOT EXISTS installers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  state VARCHAR(2) NOT NULL,
  availability BOOLEAN DEFAULT TRUE,
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);

-- Abandonment Reminders table
CREATE TABLE IF NOT EXISTS abandonment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  type VARCHAR(50),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NPS Surveys table
CREATE TABLE IF NOT EXISTS nps_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id),
  score INT,
  feedback TEXT,
  sent_at TIMESTAMP,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral Links table
CREATE TABLE IF NOT EXISTS referral_links (
  id UUID PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id),
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  referral_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral Conversions table
CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id UUID NOT NULL REFERENCES referral_links(id),
  new_lead_id UUID NOT NULL REFERENCES leads(id),
  converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_proposals_tenant ON proposals(tenant_id);
CREATE INDEX idx_deals_tenant ON deals(tenant_id);
CREATE INDEX idx_installers_tenant ON installers(tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
