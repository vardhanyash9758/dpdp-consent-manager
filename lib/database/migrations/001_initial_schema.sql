-- DPDP Consent Management System - Initial Database Schema
-- Based on DATABASE-SCHEMA-SPECIFICATION.json

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types (with IF NOT EXISTS to avoid conflicts)
DO $$ BEGIN
    CREATE TYPE consent_status AS ENUM ('accepted', 'rejected', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_status AS ENUM ('active', 'inactive', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE purpose_category AS ENUM ('essential', 'analytics', 'marketing', 'personalization', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vendor_category AS ENUM ('analytics', 'kyc', 'messaging', 'infra', 'payments', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dpa_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_entity_type AS ENUM ('template', 'consent', 'vendor', 'purpose');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'view');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE email_event_type AS ENUM (
      'template_created', 'template_activated', 'template_deactivated',
      'consent_collected', 'consent_withdrawn',
      'vendor_created', 'vendor_approved', 'vendor_rejected',
      'dpa_uploaded', 'dpa_approved', 'dpa_expiring', 'dpa_expired',
      'compliance_alert', 'bulk_action_completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Consent Templates Table
CREATE TABLE IF NOT EXISTS consent_templates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status template_status NOT NULL DEFAULT 'draft',
  banner_config JSONB NOT NULL,
  translations JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) NOT NULL,
  organization_id VARCHAR(255) NOT NULL
);

-- 2. Consent Purposes Table
CREATE TABLE IF NOT EXISTS consent_purposes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  category purpose_category NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Template Purposes Junction Table
CREATE TABLE IF NOT EXISTS template_purposes (
  id VARCHAR(255) PRIMARY KEY,
  template_id VARCHAR(255) NOT NULL REFERENCES consent_templates(id) ON DELETE CASCADE,
  purpose_id VARCHAR(255) NOT NULL REFERENCES consent_purposes(id) ON DELETE RESTRICT,
  data_fields JSONB,
  third_party_sources JSONB,
  platforms JSONB,
  validity_days INTEGER DEFAULT 365,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id, purpose_id)
);

-- 4. Consent Records Table
CREATE TABLE IF NOT EXISTS consent_records (
  id VARCHAR(255) PRIMARY KEY,
  template_id VARCHAR(255) NOT NULL REFERENCES consent_templates(id) ON DELETE CASCADE,
  user_reference_id VARCHAR(255) NOT NULL,
  status consent_status NOT NULL,
  accepted_purposes JSONB,
  platform VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  consent_timestamp TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id VARCHAR(255) PRIMARY KEY,
  vendor_name VARCHAR(255) NOT NULL,
  category vendor_category NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  notes TEXT,
  dpa_status dpa_status DEFAULT 'PENDING',
  dpa_file_url VARCHAR(500),
  dpa_signed_on DATE,
  dpa_valid_till DATE,
  allowed_purposes JSONB,
  allowed_data_types JSONB,
  risk_level risk_level NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Vendor Access Logs Table
CREATE TABLE IF NOT EXISTS vendor_access_logs (
  log_id VARCHAR(255) PRIMARY KEY,
  vendor_id VARCHAR(255) NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  vendor_name VARCHAR(255) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  data_types_requested JSONB,
  access_granted BOOLEAN NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  entity_type audit_entity_type NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  action audit_action NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  changes JSONB,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Email Events Table
CREATE TABLE IF NOT EXISTS email_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type email_event_type NOT NULL,
  data JSONB,
  recipients JSONB,
  status email_status DEFAULT 'pending',
  sent_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance Optimization

-- Consent Templates Indexes
CREATE INDEX IF NOT EXISTS idx_consent_templates_status ON consent_templates(status);
CREATE INDEX IF NOT EXISTS idx_consent_templates_organization ON consent_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_consent_templates_created_at ON consent_templates(created_at);

-- Consent Purposes Indexes
CREATE INDEX idx_consent_purposes_category ON consent_purposes(category);
CREATE INDEX idx_consent_purposes_active ON consent_purposes(is_active);
CREATE INDEX idx_consent_purposes_created_at ON consent_purposes(created_at);

-- Template Purposes Indexes
CREATE INDEX idx_template_purposes_template ON template_purposes(template_id);
CREATE INDEX idx_template_purposes_purpose ON template_purposes(purpose_id);

-- Consent Records Indexes
CREATE INDEX idx_consent_records_template ON consent_records(template_id);
CREATE INDEX idx_consent_records_user ON consent_records(user_reference_id);
CREATE INDEX idx_consent_records_status ON consent_records(status);
CREATE INDEX idx_consent_records_timestamp ON consent_records(consent_timestamp);
CREATE INDEX idx_consent_records_platform ON consent_records(platform);
CREATE INDEX idx_consent_records_template_timestamp ON consent_records(template_id, consent_timestamp);

-- Vendors Indexes
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_dpa_status ON vendors(dpa_status);
CREATE INDEX idx_vendors_risk_level ON vendors(risk_level);
CREATE INDEX idx_vendors_active ON vendors(is_active);
CREATE INDEX idx_vendors_dpa_expiry ON vendors(dpa_valid_till);

-- Vendor Access Logs Indexes
CREATE INDEX idx_vendor_access_logs_vendor ON vendor_access_logs(vendor_id);
CREATE INDEX idx_vendor_access_logs_granted ON vendor_access_logs(access_granted);
CREATE INDEX idx_vendor_access_logs_timestamp ON vendor_access_logs(timestamp);
CREATE INDEX idx_vendor_access_logs_purpose ON vendor_access_logs(purpose);
CREATE INDEX idx_vendor_access_logs_vendor_timestamp ON vendor_access_logs(vendor_id, timestamp, access_granted);

-- Audit Logs Indexes
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity_timestamp ON audit_logs(entity_type, entity_id, timestamp);

-- Email Events Indexes
CREATE INDEX idx_email_events_type ON email_events(event_type);
CREATE INDEX idx_email_events_status ON email_events(status);
CREATE INDEX idx_email_events_created_at ON email_events(created_at);

-- Create Functions for Automatic Timestamp Updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for Automatic Timestamp Updates
CREATE TRIGGER update_consent_templates_updated_at 
  BEFORE UPDATE ON consent_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_purposes_updated_at 
  BEFORE UPDATE ON consent_purposes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_records_updated_at 
  BEFORE UPDATE ON consent_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON vendors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Views for Common Queries

-- Active Templates with Purpose Count
CREATE VIEW active_templates_summary AS
SELECT 
  ct.id,
  ct.name,
  ct.description,
  ct.status,
  ct.created_at,
  ct.updated_at,
  COUNT(tp.purpose_id) as purpose_count
FROM consent_templates ct
LEFT JOIN template_purposes tp ON ct.id = tp.template_id
WHERE ct.status = 'active'
GROUP BY ct.id, ct.name, ct.description, ct.status, ct.created_at, ct.updated_at;

-- Vendor Risk Summary
CREATE VIEW vendor_risk_summary AS
SELECT 
  category,
  risk_level,
  COUNT(*) as vendor_count,
  COUNT(CASE WHEN dpa_status = 'APPROVED' THEN 1 END) as approved_count,
  COUNT(CASE WHEN dpa_valid_till < CURRENT_DATE + INTERVAL '30 days' AND dpa_status = 'APPROVED' THEN 1 END) as expiring_soon_count
FROM vendors
WHERE is_active = true
GROUP BY category, risk_level;

-- Consent Analytics Summary
CREATE VIEW consent_analytics_summary AS
SELECT 
  template_id,
  DATE(consent_timestamp) as consent_date,
  platform,
  status,
  COUNT(*) as consent_count
FROM consent_records
GROUP BY template_id, DATE(consent_timestamp), platform, status;

-- Grant necessary permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Insert initial system data (if needed)
-- This can be uncommented and customized based on your requirements

COMMENT ON DATABASE postgres IS 'DPDP Consent Management System Database';
COMMENT ON TABLE consent_templates IS 'Main consent template configuration';
COMMENT ON TABLE consent_purposes IS 'Reusable consent purposes';
COMMENT ON TABLE template_purposes IS 'Junction table linking templates to purposes';
COMMENT ON TABLE consent_records IS 'User consent decisions';
COMMENT ON TABLE vendors IS 'Third-party vendor management';
COMMENT ON TABLE vendor_access_logs IS 'Vendor data access audit trail';
COMMENT ON TABLE audit_logs IS 'System audit trail';
COMMENT ON TABLE email_events IS 'Email notification tracking';