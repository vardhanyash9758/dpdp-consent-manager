// API Types and Schemas - Single source of truth

export interface ConsentTemplate {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive' | 'draft'
  bannerConfig: BannerConfig
  purposes: ConsentPurpose[]
  translations: Record<string, TemplateTranslation>
  createdBy: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface BannerConfig {
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

export interface ConsentPurpose {
  id: string
  name: string
  description: string
  required: boolean
  category: 'essential' | 'analytics' | 'marketing' | 'personalization' | 'other'
}

export interface TemplateTranslation {
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
  id: string
  templateId: string
  userReferenceId: string
  status: 'accepted' | 'rejected' | 'partial'
  acceptedPurposes: string[]
  platform: string
  language: string
  userAgent: string
  ipAddress: string
  consentTimestamp: Date
  expiryDate?: Date
  createdAt: Date
  updatedAt: Date
  version: number
}

// API Request/Response Types
export interface CreateTemplateRequest {
  name: string
  description?: string
  status?: 'active' | 'inactive' | 'draft'
  bannerConfig: BannerConfig
  purposes: ConsentPurpose[]
  translations?: Record<string, TemplateTranslation>
  createdBy: string
  organizationId: string
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
  status?: 'active' | 'inactive' | 'draft'
  bannerConfig?: Partial<BannerConfig>
  purposes?: ConsentPurpose[]
  translations?: Record<string, TemplateTranslation>
  updatedBy: string
}

export interface ConsentSubmissionRequest {
  templateId: string
  userReferenceId: string
  status: 'accepted' | 'rejected' | 'partial'
  purposes: string[]
  timestamp: number
  platform: string
  language: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: string[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

// Validation Schemas
export const VALIDATION_RULES = {
  template: {
    name: { required: true, minLength: 1, maxLength: 255 },
    description: { maxLength: 1000 },
    bannerConfig: {
      title: { required: true, minLength: 1, maxLength: 200 },
      description: { required: true, minLength: 1, maxLength: 500 },
      acceptButtonText: { required: true, minLength: 1, maxLength: 50 },
      rejectButtonText: { required: true, minLength: 1, maxLength: 50 },
      customizeButtonText: { required: true, minLength: 1, maxLength: 50 },
      position: { required: true, enum: ['bottom', 'top', 'center'] },
      theme: { required: true, enum: ['light', 'dark', 'auto'] },
      primaryColor: { required: true, pattern: /^#[0-9A-Fa-f]{6}$/ },
      backgroundColor: { required: true, pattern: /^#[0-9A-Fa-f]{6}$/ },
      textColor: { required: true, pattern: /^#[0-9A-Fa-f]{6}$/ }
    },
    purposes: {
      required: true,
      minItems: 1,
      items: {
        id: { required: true, pattern: /^[a-z0-9-_]+$/ },
        name: { required: true, minLength: 1, maxLength: 100 },
        description: { required: true, minLength: 1, maxLength: 300 },
        required: { required: true, type: 'boolean' },
        category: { required: true, enum: ['essential', 'analytics', 'marketing', 'personalization', 'other'] }
      }
    },
    createdBy: { required: true, minLength: 1, maxLength: 255 },
    organizationId: { required: true, minLength: 1, maxLength: 255 }
  },
  consent: {
    templateId: { required: true, minLength: 1 },
    userReferenceId: { required: true, minLength: 1, maxLength: 255 },
    status: { required: true, enum: ['accepted', 'rejected', 'partial'] },
    purposes: { required: true, type: 'array' },
    platform: { required: true, minLength: 1, maxLength: 50 },
    language: { required: true, pattern: /^[a-z]{2}(-[A-Z]{2})?$/ }
  }
}

// Error Types
export class ValidationError extends Error {
  constructor(public field: string, public rule: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}