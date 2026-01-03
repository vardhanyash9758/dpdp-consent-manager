// Database Repository - Clean Data Layer

import { ConsentTemplate, ConsentRecord, CreateTemplateRequest, ConsentSubmissionRequest } from '@/lib/types/api'

// In-memory storage (replace with actual database in production)
class DatabaseRepository {
  private templates: Map<string, ConsentTemplate> = new Map()
  private consents: Map<string, ConsentRecord> = new Map()
  private auditLogs: Map<string, any> = new Map()

  // Template operations
  async createTemplate(data: CreateTemplateRequest): Promise<ConsentTemplate> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const template: ConsentTemplate = {
      id,
      name: data.name,
      description: data.description,
      status: data.status || 'draft',
      bannerConfig: data.bannerConfig,
      purposes: data.purposes,
      translations: data.translations || {},
      createdBy: data.createdBy,
      organizationId: data.organizationId,
      createdAt: now,
      updatedAt: now
    }
    
    this.templates.set(id, template)
    await this.createAuditLog('template', id, 'create', data.createdBy)
    
    return template
  }

  async getTemplate(id: string): Promise<ConsentTemplate | null> {
    return this.templates.get(id) || null
  }

  async getTemplates(filters: {
    status?: string
    organizationId?: string
    page?: number
    limit?: number
  } = {}): Promise<{ templates: ConsentTemplate[], total: number }> {
    let templates = Array.from(this.templates.values())
    
    // Apply filters
    if (filters.status) {
      templates = templates.filter(t => t.status === filters.status)
    }
    if (filters.organizationId) {
      templates = templates.filter(t => t.organizationId === filters.organizationId)
    }
    
    // Sort by creation date (newest first)
    templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    const total = templates.length
    
    // Apply pagination
    if (filters.page && filters.limit) {
      const start = (filters.page - 1) * filters.limit
      templates = templates.slice(start, start + filters.limit)
    }
    
    return { templates, total }
  }

  async updateTemplate(id: string, updates: Partial<ConsentTemplate>, userId: string): Promise<ConsentTemplate | null> {
    const existing = this.templates.get(id)
    if (!existing) return null

    const updated: ConsentTemplate = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date()
    }

    this.templates.set(id, updated)
    await this.createAuditLog('template', id, 'update', userId, updates)
    
    return updated
  }

  async deleteTemplate(id: string, userId: string): Promise<boolean> {
    const exists = this.templates.has(id)
    if (exists) {
      this.templates.delete(id)
      await this.createAuditLog('template', id, 'delete', userId)
    }
    return exists
  }

  // Consent operations
  async createConsent(data: ConsentSubmissionRequest, metadata: {
    userAgent: string
    ipAddress: string
  }): Promise<ConsentRecord> {
    const id = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const consent: ConsentRecord = {
      id,
      templateId: data.templateId,
      userReferenceId: data.userReferenceId,
      status: data.status,
      acceptedPurposes: data.purposes,
      platform: data.platform,
      language: data.language,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      consentTimestamp: new Date(data.timestamp),
      createdAt: now,
      updatedAt: now,
      version: 1
    }
    
    this.consents.set(id, consent)
    await this.createAuditLog('consent', id, 'create', data.userReferenceId)
    
    return consent
  }

  async getConsent(id: string): Promise<ConsentRecord | null> {
    return this.consents.get(id) || null
  }

  async getConsentsByTemplate(templateId: string): Promise<ConsentRecord[]> {
    return Array.from(this.consents.values()).filter(c => c.templateId === templateId)
  }

  async getConsentsByUser(userReferenceId: string): Promise<ConsentRecord[]> {
    return Array.from(this.consents.values()).filter(c => c.userReferenceId === userReferenceId)
  }

  async updateConsent(id: string, updates: Partial<ConsentRecord>): Promise<ConsentRecord | null> {
    const existing = this.consents.get(id)
    if (!existing) return null

    const updated: ConsentRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      version: existing.version + 1
    }

    this.consents.set(id, updated)
    await this.createAuditLog('consent', id, 'update', existing.userReferenceId, updates)
    
    return updated
  }

  // Audit operations
  private async createAuditLog(
    entityType: 'template' | 'consent',
    entityId: string,
    action: 'create' | 'update' | 'delete' | 'view',
    userId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const auditLog = {
      id,
      entityType,
      entityId,
      action,
      userId,
      timestamp: new Date(),
      changes,
      metadata: {
        userAgent: 'system',
        ipAddress: 'localhost'
      }
    }
    
    this.auditLogs.set(id, auditLog)
  }

  async getAuditLogs(filters: {
    entityType?: string
    entityId?: string
    userId?: string
    page?: number
    limit?: number
  } = {}): Promise<{ logs: any[], total: number }> {
    let logs = Array.from(this.auditLogs.values())
    
    // Apply filters
    if (filters.entityType) {
      logs = logs.filter(log => log.entityType === filters.entityType)
    }
    if (filters.entityId) {
      logs = logs.filter(log => log.entityId === filters.entityId)
    }
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId)
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    const total = logs.length
    
    // Apply pagination
    if (filters.page && filters.limit) {
      const start = (filters.page - 1) * filters.limit
      logs = logs.slice(start, start + filters.limit)
    }
    
    return { logs, total }
  }

  // Analytics
  async getConsentAnalytics(filters: {
    templateId?: string
    startDate?: Date
    endDate?: Date
  } = {}): Promise<{
    totalConsents: number
    acceptedConsents: number
    rejectedConsents: number
    partialConsents: number
    acceptanceRate: number
  }> {
    let consents = Array.from(this.consents.values())
    
    // Apply filters
    if (filters.templateId) {
      consents = consents.filter(c => c.templateId === filters.templateId)
    }
    if (filters.startDate) {
      consents = consents.filter(c => c.consentTimestamp >= filters.startDate!)
    }
    if (filters.endDate) {
      consents = consents.filter(c => c.consentTimestamp <= filters.endDate!)
    }
    
    const totalConsents = consents.length
    const acceptedConsents = consents.filter(c => c.status === 'accepted').length
    const rejectedConsents = consents.filter(c => c.status === 'rejected').length
    const partialConsents = consents.filter(c => c.status === 'partial').length
    const acceptanceRate = totalConsents > 0 ? (acceptedConsents / totalConsents) * 100 : 0
    
    return {
      totalConsents,
      acceptedConsents,
      rejectedConsents,
      partialConsents,
      acceptanceRate
    }
  }
}

// Singleton instance
export const db = new DatabaseRepository()