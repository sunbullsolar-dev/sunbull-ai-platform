-- ============================================================================
-- SUNBULL AI PLATFORM - INITIAL SCHEMA
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  auth0_id VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  company_name VARCHAR(255),
  position VARCHAR(100),
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CUSTOMERS & LEADS
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  lat NUMERIC(10, 8),
  lng NUMERIC(11, 8),
  status VARCHAR(50) DEFAULT 'lead',
  score NUMERIC(5, 2),
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  lead_score NUMERIC(5, 2),
  solar_potential NUMERIC(5, 2),
  roof_size NUMERIC(8, 2),
  annual_consumption_kwh NUMERIC(10, 2),
  average_bill NUMERIC(10, 2),
  status VARCHAR(50) DEFAULT 'new',
  last_contacted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SOLAR DESIGNS & QUOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS solar_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  system_size_kw NUMERIC(8, 2) NOT NULL,
  panel_count INTEGER,
  inverter_type VARCHAR(100),
  racking_type VARCHAR(100),
  estimated_production_kwh NUMERIC(10, 2),
  rooftop_shading NUMERIC(5, 2),
  azimuth NUMERIC(6, 2),
  tilt_angle NUMERIC(6, 2),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID NOT NULL REFERENCES solar_designs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  system_cost NUMERIC(12, 2) NOT NULL,
  equipment_cost NUMERIC(12, 2),
  installation_cost NUMERIC(12, 2),
  soft_costs NUMERIC(12, 2),
  federal_tax_credit NUMERIC(12, 2),
  rebates NUMERIC(12, 2),
  net_cost NUMERIC(12, 2),
  monthly_payment NUMERIC(10, 2),
  payback_period_years NUMERIC(5, 2),
  year_25_savings NUMERIC(12, 2),
  validity_days INTEGER DEFAULT 30,
  status VARCHAR(50) DEFAULT 'pending_review',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- ============================================================================
-- FINANCING OPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS financing_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  provider VARCHAR(100),
  loan_term_years INTEGER,
  interest_rate NUMERIC(6, 2),
  monthly_payment NUMERIC(10, 2),
  total_amount_financed NUMERIC(12, 2),
  down_payment NUMERIC(12, 2),
  apr NUMERIC(6, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROPOSALS & DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  signed_at TIMESTAMP,
  signed_by_name VARCHAR(255),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMMUNICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  channel VARCHAR(50),
  message_type VARCHAR(50),
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- APPOINTMENTS & MEETINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255),
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  location VARCHAR(255),
  video_conference_url TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  file_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TRANSACTIONS & PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  transaction_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  action VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_leads_customer_id ON leads(customer_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_communications_customer_id ON communications(customer_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_customer_id ON activity_logs(customer_id);
