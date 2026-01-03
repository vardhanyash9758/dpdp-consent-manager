# Design Document

## Overview

The Consent Banner Backend System is a comprehensive solution for managing consent templates and collecting user consent data across multiple web applications. The system consists of a dashboard interface for template management, a database schema for data persistence, REST APIs for template and consent management, and an SDK for embedding consent banners in external websites.

## Architecture

The system follows a three-tier architecture:

1. **Presentation Layer**: Dashboard UI for template management and configuration
2. **Application Layer**: REST APIs for template CRUD operations and consent collection
3. **Data Layer**: Database with proper schema for templates, consents, and audit trails

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard UI  │    │   External Web  │    │      SDK        │
│   (Template     │    │   Applications  │    │   (Embedded)    │
│   Management)   │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │     REST APIs           │
                    │  - Template Management  │
                    │  - Consent Collection   │
                    │  - Analytics           │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │      Database           │
                    │  - Templates           │
                    │  - Consents            │
                    │  - Audit Logs          │
                    └─────────────────────────┘
```

## Components and Interfaces

### 1. Template Management Component
- **Purpose**: Handle CRUD operations for consent templates
- **Interface**: REST API endpoints for template management
- **Responsibilities**:
  - Create new consent templates
  - Update existing templates
  - Delete templates
  - List all templates with pagination

### 2. Consent Collection Component
- **Purpose**: Capture and store user consent decisions
- **Interface**: Public API endpoint for consent submission
- **Responsibilities**:
  - Validate consent data
  - Store consent with audit information
  - Handle consent updates and withdrawals

### 3. Template Rendering Component
- **Purpose**: Serve template data to embedded SDK
- **Interface**: Public API endpoint for template retrieval
- **Responsibilities**:
  - Fetch template configuration by ID
  - Return template data in SDK-compatible format
  - Handle template versioning

### 4. Dashboard Integration Component
- **Purpose**: Integrate template management into existing dashboard
- **Interface**: React components within dashboard sections
- **Responsibilities**:
  - Provide template creation UI
  - Display template list and status
  - Generate embed codes

## Data Models

### ConsentTemplate
```typescript
interface ConsentTemplate {
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

interface ConsentPurpose {
  id: string
  name: string
  description: string
  required: boolean
  category: 'essential' | 'analytics' | 'marketing' | 'personalization' | 'other'
}

interface ConsentTemplateTranslation {
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
```

### ConsentRecord
```typescript
interface ConsentRecord {
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
```

### AuditLog
```typescript
interface AuditLog {
  id: string
  entityType: 'template' | 'consent'
  entityId: string
  action: 'create' | 'update' | 'delete' | 'view'
  userId: string
  timestamp: Date
  changes?: Record<string, any>  // What changed
  metadata?: Record<string, any> // Additional context
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Template Configuration Persistence
*For any* consent template created through the dashboard, saving the configuration should result in the template being retrievable with identical configuration data
**Validates: Requirements 1.2, 1.3**

### Property 2: SDK Template Rendering Consistency  
*For any* active consent template, when the SDK requests template data, the rendered banner should match exactly the configuration stored in the database
**Validates: Requirements 2.2, 2.5**

### Property 3: Consent Data Integrity
*For any* consent submission, the stored consent record should contain all required fields and maintain referential integrity with the template
**Validates: Requirements 2.4, 3.1**

### Property 4: Audit Trail Completeness
*For any* template or consent operation, an audit log entry should be created with complete information about the action performed
**Validates: Requirements 3.2, 3.5**

### Property 5: Template Update Propagation
*For any* template modification, all subsequent SDK requests should return the updated configuration without requiring cache invalidation
**Validates: Requirements 5.5**

### Property 6: Multi-language Consistency
*For any* template with translations, requesting the template in a supported language should return all text content in that language
**Validates: Requirements 5.4**

## Error Handling

### Template Management Errors
- **Invalid Template Data**: Return 400 with validation errors
- **Template Not Found**: Return 404 with clear error message
- **Unauthorized Access**: Return 403 with authentication requirements
- **Database Connection Issues**: Return 503 with retry instructions

### Consent Collection Errors
- **Invalid Consent Data**: Log error and return 400 with validation details
- **Template Not Found**: Return 404 but continue processing other requests
- **Database Write Failures**: Implement retry logic with exponential backoff
- **Rate Limiting**: Return 429 with retry-after header

### SDK Integration Errors
- **Network Failures**: Implement client-side retry with fallback UI
- **Template Load Failures**: Show generic consent banner with basic options
- **API Timeouts**: Cache last known template configuration locally
- **Cross-Origin Issues**: Provide clear CORS configuration guidance

## Testing Strategy

### Unit Testing
- Test individual API endpoints with various input scenarios
- Validate database operations and data integrity
- Test template configuration validation logic
- Verify consent data processing and storage

### Property-Based Testing
- Generate random template configurations and verify persistence
- Test consent submission with various user reference IDs and purposes
- Validate audit log creation across different operation types
- Test multi-language template rendering with random language codes

### Integration Testing
- Test complete flow from dashboard template creation to SDK rendering
- Verify consent collection end-to-end with real browser interactions
- Test database migrations and schema changes
- Validate API authentication and authorization flows

### Performance Testing
- Load test consent collection API with high concurrent requests
- Test template retrieval performance with large numbers of templates
- Validate database query performance with large consent datasets
- Test SDK loading performance across different network conditions