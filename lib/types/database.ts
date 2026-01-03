// Database Schema and TypeScript Interfaces for Consent Management System

export interface ConsentTemplate {
  id: string                    // UUID primary key
  name: string                  // Template display name
  description?: string          // Optional description
  status: 'active' | 'inactive' | 'draft'
  
  // Banner Configuration
  bannerConfig: {
    title: string
    description: string
    acceptButtonText: string
    rejectButtonText: string
    customizeButtonText: string
    position: 'bottom' | 'top' | 'center'
    theme: 'light' | 'dark' | 'auto'
    primaryColor: string
    backgroundColor: string
    textColor: string
  }
  
  // Consent Purposes
  purposes: ConsentPurpose[]
  
  // Multi-language Support
  translations: Record<string, ConsentTemplateTranslation>
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  organizationId: string
}

export interface ConsentPurpose {
  id: string
  name: string
  description: string
  required: boolean
  category: 'essential' | 'analytics' | 'marketing' | 'personalization' | 'other'
  createdAt: Date
  updatedAt: Date
  usageCount?: number
  isActive: boolean
}

export interface ConsentTemplateTranslation {
  title: string
  description: string
  acceptButtonText: string
  rejectButtonText: string
  customizeButtonText: string
  purposes: Record<string, {
    name: string
    description: string
  }>
}

export interface ConsentRecord {
  id: string                    // UUID primary key
  templateId: string            // Foreign key to ConsentTemplate
  userReferenceId: string       // Opaque user identifier (no PII)
  
  // Consent Decision
  status: 'accepted' | 'rejected' | 'partial'
  acceptedPurposes: string[]    // Array of purpose IDs
  
  // Context Information
  platform: string              // 'web', 'mobile', etc.
  language: string              // ISO language code
  userAgent: string             // Browser/client information
  ipAddress: string             // For audit purposes
  
  // Timestamps
  consentTimestamp: Date        // When consent was given
  expiryDate?: Date            // When consent expires
  
  // Audit Trail
  createdAt: Date
  updatedAt: Date
  version: number               // For tracking consent updates
}

export interface AuditLog {
  id: string
  entityType: 'template' | 'consent' | 'vendor' | 'purpose'
  entityId: string
  action: 'create' | 'update' | 'delete' | 'view'
  userId: string
  timestamp: Date
  changes?: Record<string, any>  // What changed
  metadata?: Record<string, any> // Additional context
}

// Vendor Management Schema
export interface Vendor {
  vendor_id: string
  vendor_name: string
  category: 'analytics' | 'kyc' | 'messaging' | 'infra' | 'payments' | 'other'
  contact_name: string
  contact_email: string
  notes?: string
  dpa_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  dpa_file_url?: string
  dpa_signed_on?: Date
  dpa_valid_till?: Date
  allowed_purposes: string[]
  allowed_data_types: string[]
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface VendorAccessLog {
  log_id: string
  vendor_id: string
  vendor_name: string
  purpose: string
  data_types_requested: string[]
  access_granted: boolean
  reason?: string
  timestamp: Date
}