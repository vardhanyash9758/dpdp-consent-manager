import { PoolClient } from 'pg'
import { db, executeTransaction } from './connection'
import { 
  ConsentTemplate, 
  ConsentPurpose, 
  ConsentRecord, 
  AuditLog,
  Vendor,
  VendorAccessLog
} from '../types/database'

export class PostgresRepository {
  // Template operations
  async createTemplate(template: Omit<ConsentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConsentTemplate> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const query = `
      INSERT INTO consent_templates (
        id, name, description, status, banner_config, 
        translations, created_by, organization_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    
    const values = [
      id,
      template.name,
      template.description,
      template.status,
      JSON.stringify(template.bannerConfig),
      JSON.stringify(template.translations || {}),
      template.createdBy,
      template.organizationId
    ]
    
    const result = await db.query(query, values)
    const row = result.rows[0]
    
    // Create audit log
    await this.createAuditLog('template', id, 'create', template.createdBy)
    
    return this.mapTemplateRow(row)
  }

  async getTemplate(id: string): Promise<ConsentTemplate | null> {
    const query = 'SELECT * FROM consent_templates WHERE id = $1'
    const result = await db.query(query, [id])
    
    if (result.rows.length === 0) return null
    
    return this.mapTemplateRow(result.rows[0])
  }

  async getAllTemplates(): Promise<ConsentTemplate[]> {
    const query = 'SELECT * FROM consent_templates ORDER BY updated_at DESC'
    const result = await db.query(query)
    
    return result.rows.map((row: any) => this.mapTemplateRow(row))
  }

  async updateTemplate(id: string, updates: Partial<ConsentTemplate>, userId: string): Promise<ConsentTemplate | null> {
    const existing = await this.getTemplate(id)
    if (!existing) return null

    const setClause = []
    const values = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      setClause.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.status !== undefined) {
      setClause.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }
    if (updates.bannerConfig !== undefined) {
      setClause.push(`banner_config = $${paramIndex++}`)
      values.push(JSON.stringify(updates.bannerConfig))
    }
    if (updates.translations !== undefined) {
      setClause.push(`translations = $${paramIndex++}`)
      values.push(JSON.stringify(updates.translations))
    }

    if (setClause.length === 0) return existing

    values.push(id)
    const query = `
      UPDATE consent_templates 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await db.query(query, values)
    
    // Create audit log
    await this.createAuditLog('template', id, 'update', userId, updates)
    
    return this.mapTemplateRow(result.rows[0])
  }

  async deleteTemplate(id: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM consent_templates WHERE id = $1'
    const result = await db.query(query, [id])
    
    if (result.rowCount > 0) {
      await this.createAuditLog('template', id, 'delete', userId)
      return true
    }
    
    return false
  }

  // Purpose operations
  async createPurpose(purpose: Omit<ConsentPurpose, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ConsentPurpose> {
    const id = `purpose_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const query = `
      INSERT INTO consent_purposes (
        id, name, description, required, category, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    
    const values = [
      id,
      purpose.name,
      purpose.description,
      purpose.required,
      purpose.category,
      purpose.isActive
    ]
    
    const result = await db.query(query, values)
    return this.mapPurposeRow(result.rows[0])
  }

  async getPurpose(id: string): Promise<ConsentPurpose | null> {
    const query = 'SELECT * FROM consent_purposes WHERE id = $1'
    const result = await db.query(query, [id])
    
    if (result.rows.length === 0) return null
    
    return this.mapPurposeRow(result.rows[0])
  }

  async getAllPurposes(): Promise<ConsentPurpose[]> {
    try {
      console.log('🔍 Starting getAllPurposes...')
      
      // First test basic connection
      const testResult = await db.query('SELECT 1 as test')
      console.log('✅ Basic connection test passed:', testResult.rows[0])
      
      // Check if table exists
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'consent_purposes'
        )
      `)
      console.log('📊 Table exists check:', tableCheck.rows[0].exists)
      
      // Try the actual query
      const query = 'SELECT * FROM consent_purposes ORDER BY updated_at DESC'
      console.log('🔄 Executing query:', query)
      const result = await db.query(query)
      console.log('✅ Query successful, rows:', result.rows.length)
      
      return result.rows.map((row: any) => this.mapPurposeRow(row))
    } catch (error) {
      console.error('❌ getAllPurposes error:', error)
      throw error
    }
  }

  async updatePurpose(id: string, updates: Partial<ConsentPurpose>): Promise<ConsentPurpose | null> {
    const existing = await this.getPurpose(id)
    if (!existing) return null

    const setClause = []
    const values = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      setClause.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.required !== undefined) {
      setClause.push(`required = $${paramIndex++}`)
      values.push(updates.required)
    }
    if (updates.category !== undefined) {
      setClause.push(`category = $${paramIndex++}`)
      values.push(updates.category)
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${paramIndex++}`)
      values.push(updates.isActive)
    }

    if (setClause.length === 0) return existing

    values.push(id)
    const query = `
      UPDATE consent_purposes 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await db.query(query, values)
    return this.mapPurposeRow(result.rows[0])
  }

  async deletePurpose(id: string): Promise<boolean> {
    const query = 'DELETE FROM consent_purposes WHERE id = $1'
    const result = await db.query(query, [id])
    
    return result.rowCount > 0
  }

  // Consent operations
  async createConsent(consent: Omit<ConsentRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<ConsentRecord> {
    const id = `consent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const query = `
      INSERT INTO consent_records (
        id, template_id, user_reference_id, status, accepted_purposes,
        platform, language, user_agent, ip_address, consent_timestamp, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `
    
    const values = [
      id,
      consent.templateId,
      consent.userReferenceId,
      consent.status,
      JSON.stringify(consent.acceptedPurposes || []),
      consent.platform,
      consent.language,
      consent.userAgent,
      consent.ipAddress,
      consent.consentTimestamp,
      consent.expiryDate
    ]
    
    const result = await db.query(query, values)
    
    // Create audit log
    await this.createAuditLog('consent', id, 'create', consent.userReferenceId)
    
    return this.mapConsentRow(result.rows[0])
  }

  async getConsent(id: string): Promise<ConsentRecord | null> {
    const query = 'SELECT * FROM consent_records WHERE id = $1'
    const result = await db.query(query, [id])
    
    if (result.rows.length === 0) return null
    
    return this.mapConsentRow(result.rows[0])
  }

  async getConsentsByTemplate(templateId: string): Promise<ConsentRecord[]> {
    const query = 'SELECT * FROM consent_records WHERE template_id = $1 ORDER BY consent_timestamp DESC'
    const result = await db.query(query, [templateId])
    
    return result.rows.map((row: any) => this.mapConsentRow(row))
  }

  async getConsentsByUser(userReferenceId: string): Promise<ConsentRecord[]> {
    const query = 'SELECT * FROM consent_records WHERE user_reference_id = $1 ORDER BY consent_timestamp DESC'
    const result = await db.query(query, [userReferenceId])
    
    return result.rows.map((row: any) => this.mapConsentRow(row))
  }

  // Vendor operations
  async createVendor(vendor: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at' | 'risk_level' | 'dpa_status'>): Promise<Vendor> {
    const vendor_id = `vendor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const risk_level = this.calculateRiskLevel({ ...vendor, vendor_id, dpa_status: 'PENDING' } as Vendor)
    
    const query = `
      INSERT INTO vendors (
        vendor_id, vendor_name, category, contact_name, contact_email,
        notes, allowed_purposes, allowed_data_types, risk_level, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    
    const values = [
      vendor_id,
      vendor.vendor_name,
      vendor.category,
      vendor.contact_name,
      vendor.contact_email,
      vendor.notes,
      JSON.stringify(vendor.allowed_purposes || []),
      JSON.stringify(vendor.allowed_data_types || []),
      risk_level,
      vendor.is_active !== undefined ? vendor.is_active : true
    ]
    
    const result = await db.query(query, values)
    return this.mapVendorRow(result.rows[0])
  }

  async getVendor(vendor_id: string): Promise<Vendor | null> {
    const query = 'SELECT * FROM vendors WHERE vendor_id = $1'
    const result = await db.query(query, [vendor_id])
    
    if (result.rows.length === 0) return null
    
    return this.mapVendorRow(result.rows[0])
  }

  async getAllVendors(): Promise<Vendor[]> {
    const query = 'SELECT * FROM vendors ORDER BY updated_at DESC'
    const result = await db.query(query)
    
    return result.rows.map((row: any) => this.mapVendorRow(row))
  }

  async updateVendor(vendor_id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    const existing = await this.getVendor(vendor_id)
    if (!existing) return null

    const setClause: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    Object.keys(updates).forEach(key => {
      if (key !== 'vendor_id' && key !== 'created_at' && updates[key as keyof Vendor] !== undefined) {
        const dbColumn = key === 'vendor_name' ? 'vendor_name' :
                        key === 'contact_name' ? 'contact_name' :
                        key === 'contact_email' ? 'contact_email' :
                        key === 'dpa_status' ? 'dpa_status' :
                        key === 'dpa_file_url' ? 'dpa_file_url' :
                        key === 'dpa_signed_on' ? 'dpa_signed_on' :
                        key === 'dpa_valid_till' ? 'dpa_valid_till' :
                        key === 'allowed_purposes' ? 'allowed_purposes' :
                        key === 'allowed_data_types' ? 'allowed_data_types' :
                        key === 'risk_level' ? 'risk_level' :
                        key === 'is_active' ? 'is_active' :
                        key.replace(/([A-Z])/g, '_$1').toLowerCase()

        setClause.push(`${dbColumn} = $${paramIndex++}`)
        
        const value = updates[key as keyof Vendor]
        if (key === 'allowed_purposes' || key === 'allowed_data_types') {
          values.push(JSON.stringify(value))
        } else {
          values.push(value)
        }
      }
    })

    if (setClause.length === 0) return existing

    values.push(vendor_id)
    const query = `
      UPDATE vendors 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = $${paramIndex}
      RETURNING *
    `

    const result = await db.query(query, values)
    return this.mapVendorRow(result.rows[0])
  }

  async deleteVendor(vendor_id: string): Promise<boolean> {
    const query = 'DELETE FROM vendors WHERE vendor_id = $1'
    const result = await db.query(query, [vendor_id])
    
    return result.rowCount > 0
  }

  // Audit log operations
  private async createAuditLog(
    entityType: 'template' | 'consent' | 'vendor' | 'purpose',
    entityId: string,
    action: 'create' | 'update' | 'delete' | 'view',
    userId: string,
    changes?: Record<string, any>
  ): Promise<AuditLog> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const query = `
      INSERT INTO audit_logs (
        id, entity_type, entity_id, action, user_id, changes, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    
    const values = [
      id,
      entityType,
      entityId,
      action,
      userId,
      JSON.stringify(changes || {}),
      JSON.stringify({
        userAgent: 'system',
        ipAddress: 'localhost'
      })
    ]
    
    const result = await db.query(query, values)
    return this.mapAuditLogRow(result.rows[0])
  }

  async getAuditLogs(entityType?: string, entityId?: string): Promise<AuditLog[]> {
    let query = 'SELECT * FROM audit_logs'
    const conditions = []
    const values = []
    let paramIndex = 1

    if (entityType) {
      conditions.push(`entity_type = $${paramIndex++}`)
      values.push(entityType)
    }

    if (entityId) {
      conditions.push(`entity_id = $${paramIndex++}`)
      values.push(entityId)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY timestamp DESC'

    const result = await db.query(query, values)
    return result.rows.map((row: any) => this.mapAuditLogRow(row))
  }

  // Vendor statistics
  async getVendorStats(): Promise<{
    total_vendors: number
    approved_vendors: number
    pending_dpa: number
    high_risk_vendors: number
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_vendors,
        COUNT(CASE WHEN dpa_status = 'APPROVED' THEN 1 END) as approved_vendors,
        COUNT(CASE WHEN dpa_status = 'PENDING' THEN 1 END) as pending_dpa,
        COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) as high_risk_vendors
      FROM vendors
    `
    
    const result = await db.query(query)
    const row = result.rows[0]
    
    return {
      total_vendors: parseInt(row.total_vendors),
      approved_vendors: parseInt(row.approved_vendors),
      pending_dpa: parseInt(row.pending_dpa),
      high_risk_vendors: parseInt(row.high_risk_vendors)
    }
  }

  // Helper methods for mapping database rows to TypeScript objects
  private mapTemplateRow(row: any): ConsentTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      bannerConfig: row.banner_config,
      purposes: [], // Will be populated separately if needed
      translations: row.translations || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      organizationId: row.organization_id
    }
  }

  private mapPurposeRow(row: any): ConsentPurpose {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      required: row.required,
      category: row.category,
      isActive: row.is_active,
      usageCount: row.usage_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  private mapConsentRow(row: any): ConsentRecord {
    return {
      id: row.id,
      templateId: row.template_id,
      userReferenceId: row.user_reference_id,
      status: row.status,
      acceptedPurposes: row.accepted_purposes || [],
      platform: row.platform,
      language: row.language,
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      consentTimestamp: new Date(row.consent_timestamp),
      expiryDate: row.expiry_date ? new Date(row.expiry_date) : undefined,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  private mapVendorRow(row: any): Vendor {
    return {
      vendor_id: row.vendor_id,
      vendor_name: row.vendor_name,
      category: row.category,
      contact_name: row.contact_name,
      contact_email: row.contact_email,
      notes: row.notes,
      dpa_status: row.dpa_status,
      dpa_file_url: row.dpa_file_url,
      dpa_signed_on: row.dpa_signed_on ? new Date(row.dpa_signed_on) : undefined,
      dpa_valid_till: row.dpa_valid_till ? new Date(row.dpa_valid_till) : undefined,
      allowed_purposes: row.allowed_purposes || [],
      allowed_data_types: row.allowed_data_types || [],
      risk_level: row.risk_level,
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  private mapAuditLogRow(row: any): AuditLog {
    return {
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      userId: row.user_id,
      timestamp: new Date(row.timestamp),
      changes: row.changes,
      metadata: row.metadata
    }
  }

  // Risk calculation helper
  private calculateRiskLevel(vendor: Partial<Vendor>): 'LOW' | 'MEDIUM' | 'HIGH' {
    // HIGH RISK conditions
    if (vendor.category === 'kyc' || vendor.category === 'payments') return 'HIGH'
    if (vendor.allowed_data_types?.includes('aadhaar') || vendor.allowed_data_types?.includes('pan')) return 'HIGH'
    if (vendor.dpa_status !== 'APPROVED') return 'HIGH'
    
    // MEDIUM RISK conditions
    if (vendor.allowed_data_types?.some(dt => ['name', 'email', 'phone', 'address'].includes(dt))) return 'MEDIUM'
    
    // LOW RISK (default)
    return 'LOW'
  }
}

// Export singleton instance
export const postgresRepository = new PostgresRepository()