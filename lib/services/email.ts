import { 
  EmailConfig, 
  SendEmailRequest, 
  EmailEvent, 
  EmailEventType, 
  EmailTemplate,
  EmailStats 
} from '@/lib/types/email'

class EmailService {
  private config: EmailConfig | null = null
  private events: Map<string, EmailEvent> = new Map()
  private templates: Map<EmailEventType, EmailTemplate> = new Map()

  constructor() {
    this.initializeDefaultTemplates()
  }

  // Initialize email service with SMTP configuration
  async initialize(config: EmailConfig): Promise<void> {
    this.config = config
    console.log('[EmailService] Email service initialized')
  }

  // Send email directly - disabled until proper SMTP is configured
  async sendEmail(request: SendEmailRequest): Promise<boolean> {
    if (!this.config) {
      console.log('[EmailService] Email service not configured')
      return false
    }

    // Email functionality disabled - implement with actual SMTP when needed
    console.log('[EmailService] Email sending disabled - configure SMTP to enable')
    return false
  }

  // Send event-based email using templates
  async sendEventEmail(
    eventType: EmailEventType, 
    data: Record<string, any>, 
    recipients: string[]
  ): Promise<string> {
    const eventId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const event: EmailEvent = {
      id: eventId,
      eventType,
      data,
      recipients,
      status: 'pending',
      createdAt: new Date()
    }

    this.events.set(eventId, event)

    try {
      const template = this.templates.get(eventType)
      if (!template || !template.isActive) {
        event.status = 'failed'
        event.error = 'Template not found or inactive'
        this.events.set(eventId, event)
        return eventId
      }

      // Process template with data
      const processedSubject = this.processTemplate(template.subject, data)
      const processedHtml = this.processTemplate(template.htmlContent, data)
      const processedText = this.processTemplate(template.textContent, data)

      const success = await this.sendEmail({
        to: recipients,
        subject: processedSubject,
        htmlContent: processedHtml,
        textContent: processedText
      })

      event.status = success ? 'sent' : 'failed'
      event.sentAt = success ? new Date() : undefined
      event.error = success ? undefined : 'Failed to send email'
      
      this.events.set(eventId, event)
      return eventId
    } catch (error) {
      event.status = 'failed'
      event.error = error instanceof Error ? error.message : 'Unknown error'
      this.events.set(eventId, event)
      return eventId
    }
  }

  // Process template with data substitution
  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template
    
    // Replace {{variable}} placeholders
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processed = processed.replace(regex, String(data[key] || ''))
    })

    // Replace common date/time placeholders
    processed = processed.replace(/{{current_date}}/g, new Date().toLocaleDateString())
    processed = processed.replace(/{{current_time}}/g, new Date().toLocaleString())
    
    return processed
  }

  // Get email statistics
  getStats(): EmailStats {
    const events = Array.from(this.events.values())
    const eventsByType: Record<EmailEventType, number> = {} as Record<EmailEventType, number>
    
    events.forEach(event => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1
    })

    return {
      total_sent: events.filter(e => e.status === 'sent').length,
      total_failed: events.filter(e => e.status === 'failed').length,
      recent_events: events
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
      events_by_type: eventsByType
    }
  }

  // Get event by ID
  getEvent(eventId: string): EmailEvent | null {
    return this.events.get(eventId) || null
  }

  // Get all events
  getAllEvents(): EmailEvent[] {
    return Array.from(this.events.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Initialize default email templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: Partial<EmailTemplate>[] = [
      {
        eventType: 'vendor_created',
        subject: 'New Vendor Added: {{vendor_name}}',
        htmlContent: `
          <h2>New Vendor Registration</h2>
          <p>A new vendor has been added to the DPDP compliance system:</p>
          <ul>
            <li><strong>Vendor Name:</strong> {{vendor_name}}</li>
            <li><strong>Category:</strong> {{category}}</li>
            <li><strong>Contact:</strong> {{contact_name}} ({{contact_email}})</li>
            <li><strong>Status:</strong> Pending DPA</li>
          </ul>
          <p>Next steps: Upload and approve the Data Processing Agreement.</p>
        `,
        textContent: `New Vendor Registration\n\nVendor: {{vendor_name}}\nCategory: {{category}}\nContact: {{contact_name}} ({{contact_email}})\nStatus: Pending DPA\n\nNext steps: Upload and approve the Data Processing Agreement.`,
        isActive: true
      },
      {
        eventType: 'vendor_approved',
        subject: 'Vendor Approved: {{vendor_name}}',
        htmlContent: `
          <h2>Vendor DPA Approved</h2>
          <p>The following vendor has been approved for data processing:</p>
          <ul>
            <li><strong>Vendor Name:</strong> {{vendor_name}}</li>
            <li><strong>DPA Signed:</strong> {{dpa_signed_on}}</li>
            <li><strong>Valid Until:</strong> {{dpa_valid_till}}</li>
            <li><strong>Risk Level:</strong> {{risk_level}}</li>
          </ul>
          <p>The vendor can now access data according to configured permissions.</p>
        `,
        textContent: `Vendor DPA Approved\n\nVendor: {{vendor_name}}\nDPA Signed: {{dpa_signed_on}}\nValid Until: {{dpa_valid_till}}\nRisk Level: {{risk_level}}\n\nThe vendor can now access data according to configured permissions.`,
        isActive: true
      },
      {
        eventType: 'vendor_rejected',
        subject: 'Vendor Rejected: {{vendor_name}}',
        htmlContent: `
          <h2>Vendor DPA Rejected</h2>
          <p>The DPA for the following vendor has been rejected:</p>
          <ul>
            <li><strong>Vendor Name:</strong> {{vendor_name}}</li>
            <li><strong>Reason:</strong> {{rejection_reason}}</li>
            <li><strong>Rejected By:</strong> {{rejected_by}}</li>
          </ul>
          <p>The vendor will need to resubmit their DPA with corrections.</p>
        `,
        textContent: `Vendor DPA Rejected\n\nVendor: {{vendor_name}}\nReason: {{rejection_reason}}\nRejected By: {{rejected_by}}\n\nThe vendor will need to resubmit their DPA with corrections.`,
        isActive: true
      },
      {
        eventType: 'dpa_uploaded',
        subject: 'DPA Document Uploaded: {{vendor_name}}',
        htmlContent: `
          <h2>DPA Document Uploaded</h2>
          <p>A new DPA document has been uploaded and requires review:</p>
          <ul>
            <li><strong>Vendor Name:</strong> {{vendor_name}}</li>
            <li><strong>Uploaded By:</strong> {{uploaded_by}}</li>
            <li><strong>File Size:</strong> {{file_size}}</li>
            <li><strong>Upload Time:</strong> {{upload_time}}</li>
          </ul>
          <p>Please review the document and approve or reject the DPA.</p>
        `,
        textContent: `DPA Document Uploaded\n\nVendor: {{vendor_name}}\nUploaded By: {{uploaded_by}}\nFile Size: {{file_size}}\nUpload Time: {{upload_time}}\n\nPlease review the document and approve or reject the DPA.`,
        isActive: true
      },
      {
        eventType: 'dpa_expiring',
        subject: 'DPA Expiring Soon: {{vendor_name}}',
        htmlContent: `
          <h2>DPA Expiration Warning</h2>
          <p>The following vendor's DPA is expiring soon:</p>
          <ul>
            <li><strong>Vendor Name:</strong> {{vendor_name}}</li>
            <li><strong>Expiry Date:</strong> {{dpa_valid_till}}</li>
            <li><strong>Days Remaining:</strong> {{days_remaining}}</li>
          </ul>
          <p><strong>Action Required:</strong> Contact the vendor to renew their DPA before expiration.</p>
        `,
        textContent: `DPA Expiration Warning\n\nVendor: {{vendor_name}}\nExpiry Date: {{dpa_valid_till}}\nDays Remaining: {{days_remaining}}\n\nAction Required: Contact the vendor to renew their DPA before expiration.`,
        isActive: true
      },
      {
        eventType: 'template_created',
        subject: 'New Consent Template Created: {{template_name}}',
        htmlContent: `
          <h2>New Consent Template</h2>
          <p>A new consent template has been created:</p>
          <ul>
            <li><strong>Template Name:</strong> {{template_name}}</li>
            <li><strong>Created By:</strong> {{created_by}}</li>
            <li><strong>Status:</strong> {{status}}</li>
            <li><strong>Purposes:</strong> {{purpose_count}} configured</li>
          </ul>
          <p>The template is ready for testing and deployment.</p>
        `,
        textContent: `New Consent Template\n\nTemplate: {{template_name}}\nCreated By: {{created_by}}\nStatus: {{status}}\nPurposes: {{purpose_count}} configured\n\nThe template is ready for testing and deployment.`,
        isActive: true
      },
      {
        eventType: 'consent_collected',
        subject: 'Consent Collected: {{template_name}}',
        htmlContent: `
          <h2>User Consent Collected</h2>
          <p>New consent has been collected:</p>
          <ul>
            <li><strong>Template:</strong> {{template_name}}</li>
            <li><strong>User ID:</strong> {{user_reference_id}}</li>
            <li><strong>Status:</strong> {{consent_status}}</li>
            <li><strong>Purposes Accepted:</strong> {{accepted_purposes}}</li>
            <li><strong>Platform:</strong> {{platform}}</li>
          </ul>
          <p>Consent has been recorded and is active.</p>
        `,
        textContent: `User Consent Collected\n\nTemplate: {{template_name}}\nUser ID: {{user_reference_id}}\nStatus: {{consent_status}}\nPurposes Accepted: {{accepted_purposes}}\nPlatform: {{platform}}\n\nConsent has been recorded and is active.`,
        isActive: true
      }
    ]

    defaultTemplates.forEach(template => {
      if (template.eventType) {
        const fullTemplate: EmailTemplate = {
          id: `template_${template.eventType}`,
          eventType: template.eventType,
          subject: template.subject || '',
          htmlContent: template.htmlContent || '',
          textContent: template.textContent || '',
          recipients: [{ type: 'role', value: 'admin' }],
          isActive: template.isActive || false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        this.templates.set(template.eventType, fullTemplate)
      }
    })
  }

  // Get template by event type
  getTemplate(eventType: EmailEventType): EmailTemplate | null {
    return this.templates.get(eventType) || null
  }

  // Update template
  updateTemplate(eventType: EmailEventType, updates: Partial<EmailTemplate>): boolean {
    const existing = this.templates.get(eventType)
    if (!existing) return false

    const updated: EmailTemplate = {
      ...existing,
      ...updates,
      eventType: existing.eventType, // Preserve event type
      id: existing.id, // Preserve ID
      updatedAt: new Date()
    }

    this.templates.set(eventType, updated)
    return true
  }

  // Get all templates
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }
}

// Global email service instance
export const emailService = new EmailService()

// Helper functions for common email scenarios
export async function sendVendorCreatedEmail(vendor: any): Promise<string> {
  return emailService.sendEventEmail('vendor_created', {
    vendor_name: vendor.vendor_name,
    category: vendor.category,
    contact_name: vendor.contact_name,
    contact_email: vendor.contact_email
  }, [])
}

export async function sendVendorApprovedEmail(vendor: any): Promise<string> {
  return emailService.sendEventEmail('vendor_approved', {
    vendor_name: vendor.vendor_name,
    dpa_signed_on: vendor.dpa_signed_on ? new Date(vendor.dpa_signed_on).toLocaleDateString() : 'N/A',
    dpa_valid_till: vendor.dpa_valid_till ? new Date(vendor.dpa_valid_till).toLocaleDateString() : 'N/A',
    risk_level: vendor.risk_level
  }, [vendor.contact_email])
}

export async function sendVendorRejectedEmail(vendor: any, reason: string, rejectedBy: string): Promise<string> {
  return emailService.sendEventEmail('vendor_rejected', {
    vendor_name: vendor.vendor_name,
    rejection_reason: reason,
    rejected_by: rejectedBy
  }, [vendor.contact_email])
}

export async function sendDPAUploadedEmail(vendor: any, uploadedBy: string, fileSize: string): Promise<string> {
  return emailService.sendEventEmail('dpa_uploaded', {
    vendor_name: vendor.vendor_name,
    uploaded_by: uploadedBy,
    file_size: fileSize,
    upload_time: new Date().toLocaleString()
  }, [])
}

export async function sendDPAExpiringEmail(vendor: any, daysRemaining: number): Promise<string> {
  return emailService.sendEventEmail('dpa_expiring', {
    vendor_name: vendor.vendor_name,
    dpa_valid_till: vendor.dpa_valid_till ? new Date(vendor.dpa_valid_till).toLocaleDateString() : 'N/A',
    days_remaining: daysRemaining.toString()
  }, [vendor.contact_email])
}

export async function sendTemplateCreatedEmail(template: any, createdBy: string): Promise<string> {
  return emailService.sendEventEmail('template_created', {
    template_name: template.name,
    created_by: createdBy,
    status: template.status,
    purpose_count: template.purposes?.length || 0
  }, [])
}

export async function sendConsentCollectedEmail(consent: any, template: any): Promise<string> {
  return emailService.sendEventEmail('consent_collected', {
    template_name: template.name,
    user_reference_id: consent.userReferenceId,
    consent_status: consent.status,
    accepted_purposes: consent.acceptedPurposes?.join(', ') || 'None',
    platform: consent.platform
  }, [])
}