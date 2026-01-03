// Validation Functions - Clean and Simple

import { 
  ConsentTemplate, 
  ConsentRecord, 
  CreateTemplateRequest, 
  ConsentSubmissionRequest,
  ValidationError,
  VALIDATION_RULES 
} from '@/lib/types/api'

export function validateCreateTemplate(data: any): CreateTemplateRequest {
  const errors: string[] = []

  // Name validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Template name is required')
  } else if (data.name.length > 255) {
    errors.push('Template name must be less than 255 characters')
  }

  // Banner config validation
  if (!data.bannerConfig) {
    errors.push('Banner configuration is required')
  } else {
    const config = data.bannerConfig
    
    if (!config.title || config.title.trim().length === 0) {
      errors.push('Banner title is required')
    }
    if (!config.description || config.description.trim().length === 0) {
      errors.push('Banner description is required')
    }
    if (!config.acceptButtonText || config.acceptButtonText.trim().length === 0) {
      errors.push('Accept button text is required')
    }
    if (!config.rejectButtonText || config.rejectButtonText.trim().length === 0) {
      errors.push('Reject button text is required')
    }
    if (!config.customizeButtonText || config.customizeButtonText.trim().length === 0) {
      errors.push('Customize button text is required')
    }
    if (!['bottom', 'top', 'center'].includes(config.position)) {
      errors.push('Position must be bottom, top, or center')
    }
    if (!['light', 'dark', 'auto'].includes(config.theme)) {
      errors.push('Theme must be light, dark, or auto')
    }
    if (!config.primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(config.primaryColor)) {
      errors.push('Primary color must be a valid hex color')
    }
    if (!config.backgroundColor || !/^#[0-9A-Fa-f]{6}$/.test(config.backgroundColor)) {
      errors.push('Background color must be a valid hex color')
    }
    if (!config.textColor || !/^#[0-9A-Fa-f]{6}$/.test(config.textColor)) {
      errors.push('Text color must be a valid hex color')
    }
  }

  // Purposes validation
  if (!data.purposes || !Array.isArray(data.purposes) || data.purposes.length === 0) {
    errors.push('At least one consent purpose is required')
  } else {
    data.purposes.forEach((purpose: any, index: number) => {
      if (!purpose.id || !/^[a-z0-9-_]+$/.test(purpose.id)) {
        errors.push(`Purpose ${index + 1}: ID must contain only lowercase letters, numbers, hyphens, and underscores`)
      }
      if (!purpose.name || purpose.name.trim().length === 0) {
        errors.push(`Purpose ${index + 1}: Name is required`)
      }
      if (!purpose.description || purpose.description.trim().length === 0) {
        errors.push(`Purpose ${index + 1}: Description is required`)
      }
      if (typeof purpose.required !== 'boolean') {
        errors.push(`Purpose ${index + 1}: Required field must be boolean`)
      }
      if (!['essential', 'analytics', 'marketing', 'personalization', 'other'].includes(purpose.category)) {
        errors.push(`Purpose ${index + 1}: Category must be essential, analytics, marketing, personalization, or other`)
      }
    })
  }

  // Created by validation
  if (!data.createdBy || data.createdBy.trim().length === 0) {
    errors.push('Created by is required')
  }

  // Organization ID validation
  if (!data.organizationId || data.organizationId.trim().length === 0) {
    errors.push('Organization ID is required')
  }

  if (errors.length > 0) {
    throw new ValidationError('template', 'validation', errors.join(', '))
  }

  return {
    name: data.name.trim(),
    description: data.description?.trim() || '',
    status: data.status || 'draft',
    bannerConfig: {
      title: data.bannerConfig.title.trim(),
      description: data.bannerConfig.description.trim(),
      acceptButtonText: data.bannerConfig.acceptButtonText.trim(),
      rejectButtonText: data.bannerConfig.rejectButtonText.trim(),
      customizeButtonText: data.bannerConfig.customizeButtonText.trim(),
      position: data.bannerConfig.position,
      theme: data.bannerConfig.theme,
      primaryColor: data.bannerConfig.primaryColor,
      backgroundColor: data.bannerConfig.backgroundColor,
      textColor: data.bannerConfig.textColor
    },
    purposes: data.purposes,
    translations: data.translations || {},
    createdBy: data.createdBy.trim(),
    organizationId: data.organizationId.trim()
  }
}

export function validateConsentSubmission(data: any): ConsentSubmissionRequest {
  const errors: string[] = []

  // Template ID validation
  if (!data.templateId || typeof data.templateId !== 'string' || data.templateId.trim().length === 0) {
    errors.push('Template ID is required')
  }

  // User reference ID validation
  if (!data.userReferenceId || typeof data.userReferenceId !== 'string' || data.userReferenceId.trim().length === 0) {
    errors.push('User reference ID is required')
  } else if (data.userReferenceId.length > 255) {
    errors.push('User reference ID must be less than 255 characters')
  }

  // Status validation
  if (!data.status || !['accepted', 'rejected', 'partial'].includes(data.status)) {
    errors.push('Status must be accepted, rejected, or partial')
  }

  // Purposes validation
  if (!Array.isArray(data.purposes)) {
    errors.push('Purposes must be an array')
  }

  // Platform validation
  if (!data.platform || typeof data.platform !== 'string' || data.platform.trim().length === 0) {
    errors.push('Platform is required')
  } else if (data.platform.length > 50) {
    errors.push('Platform must be less than 50 characters')
  }

  // Language validation
  if (!data.language || typeof data.language !== 'string' || !/^[a-z]{2}(-[A-Z]{2})?$/.test(data.language)) {
    errors.push('Language must be a valid language code (e.g., en, en-US)')
  }

  // Timestamp validation
  if (data.timestamp && (typeof data.timestamp !== 'number' || data.timestamp <= 0)) {
    errors.push('Timestamp must be a positive number')
  }

  if (errors.length > 0) {
    throw new ValidationError('consent', 'validation', errors.join(', '))
  }

  return {
    templateId: data.templateId.trim(),
    userReferenceId: data.userReferenceId.trim(),
    status: data.status,
    purposes: data.purposes || [],
    timestamp: data.timestamp || Date.now(),
    platform: data.platform.trim(),
    language: data.language.trim()
  }
}

export function validateTemplateId(templateId: string): string {
  if (!templateId || typeof templateId !== 'string' || templateId.trim().length === 0) {
    throw new ValidationError('templateId', 'required', 'Template ID is required')
  }
  return templateId.trim()
}

export function validatePagination(page?: string, limit?: string) {
  const pageNum = page ? parseInt(page, 10) : 1
  const limitNum = limit ? parseInt(limit, 10) : 10

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('page', 'invalid', 'Page must be a positive number')
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError('limit', 'invalid', 'Limit must be between 1 and 100')
  }

  return { page: pageNum, limit: limitNum }
}