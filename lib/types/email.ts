export type EmailEventType = 
  | 'template_created'
  | 'template_activated'
  | 'template_deactivated'
  | 'consent_collected'
  | 'consent_withdrawn'
  | 'vendor_created'
  | 'vendor_approved'
  | 'vendor_rejected'
  | 'dpa_uploaded'
  | 'dpa_approved'
  | 'dpa_expiring'
  | 'dpa_expired'
  | 'compliance_alert'
  | 'bulk_action_completed'

export interface EmailTemplate {
  id: string
  eventType: EmailEventType
  subject: string
  htmlContent: string
  textContent: string
  recipients: EmailRecipient[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailRecipient {
  type: 'role' | 'email'
  value: string // role name or email address
}

export interface EmailEvent {
  id: string
  eventType: EmailEventType
  data: Record<string, any>
  recipients: string[]
  status: 'pending' | 'sent' | 'failed'
  sentAt?: Date
  error?: string
  createdAt: Date
}

export interface EmailConfig {
  smtp: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  from: {
    name: string
    email: string
  }
  replyTo?: string
}

export interface SendEmailRequest {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  htmlContent: string
  textContent?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType: string
}

export interface EmailStats {
  total_sent: number
  total_failed: number
  recent_events: EmailEvent[]
  events_by_type: Record<EmailEventType, number>
}