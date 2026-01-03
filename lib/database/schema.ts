// Re-export database types
export * from '../types/database'
import { ConsentTemplate, ConsentRecord } from '../types/database'

// Import PostgreSQL repository
import { postgresRepository } from './postgres-repository'

// Global database instance - now using PostgreSQL
export const database = postgresRepository



// Validation functions
export function validateTemplate(template: Partial<ConsentTemplate>): string[] {
  const errors: string[] = []
  
  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required')
  }
  
  if (!template.bannerConfig) {
    errors.push('Banner configuration is required')
  } else {
    if (!template.bannerConfig.title || template.bannerConfig.title.trim().length === 0) {
      errors.push('Banner title is required')
    }
    if (!template.bannerConfig.description || template.bannerConfig.description.trim().length === 0) {
      errors.push('Banner description is required')
    }
    if (!template.bannerConfig.acceptButtonText || template.bannerConfig.acceptButtonText.trim().length === 0) {
      errors.push('Accept button text is required')
    }
    if (!template.bannerConfig.rejectButtonText || template.bannerConfig.rejectButtonText.trim().length === 0) {
      errors.push('Reject button text is required')
    }
  }
  
  if (!template.purposes || template.purposes.length === 0) {
    errors.push('At least one consent purpose is required')
  }
  
  if (!template.createdBy || template.createdBy.trim().length === 0) {
    errors.push('Created by user ID is required')
  }
  
  if (!template.organizationId || template.organizationId.trim().length === 0) {
    errors.push('Organization ID is required')
  }
  
  return errors
}

export function validateConsent(consent: Partial<ConsentRecord>): string[] {
  const errors: string[] = []
  
  if (!consent.templateId || consent.templateId.trim().length === 0) {
    errors.push('Template ID is required')
  }
  
  if (!consent.userReferenceId || consent.userReferenceId.trim().length === 0) {
    errors.push('User reference ID is required')
  }
  
  if (!consent.status || !['accepted', 'rejected', 'partial'].includes(consent.status)) {
    errors.push('Valid consent status is required (accepted, rejected, or partial)')
  }
  
  if (!consent.platform || consent.platform.trim().length === 0) {
    errors.push('Platform is required')
  }
  
  if (!consent.language || consent.language.trim().length === 0) {
    errors.push('Language is required')
  }
  
  return errors
}