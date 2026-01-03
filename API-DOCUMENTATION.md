# DPDP Consent Manager API Documentation

## Overview

The DPDP Consent Manager provides a comprehensive API for managing consent templates and collecting user consent in compliance with India's Digital Personal Data Protection (DPDP) Act. The system follows a clean architecture pattern with proper validation, error handling, and audit trails.

## Base URL

```
Production: https://your-domain.com
Development: http://localhost:3000
```

## Authentication

Currently, the API uses organization-based access control. All requests should include appropriate headers for CORS compliance.

## API Endpoints

### 1. Health Check

#### GET `/api/health`

Check the system health and connectivity.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-12-15T18:01:52.857Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "api": "operational"
  }
}
```

**Status Codes:**
- `200` - System healthy
- `503` - System unhealthy

---

### 2. Template Management

#### GET `/api/templates`

Retrieve a list of consent templates with pagination and filtering.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `draft`)
- `organizationId` (optional): Filter by organization
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example Request:**
```bash
GET /api/templates?status=active&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_1765821731248_2gwkngyp2",
      "name": "Privacy & Cookie Consent",
      "description": "Standard privacy consent template",
      "status": "active",
      "bannerConfig": {
        "title": "Privacy & Cookie Consent",
        "description": "We use cookies to enhance your experience",
        "acceptButtonText": "Accept All",
        "rejectButtonText": "Reject All",
        "customizeButtonText": "Customize",
        "position": "bottom",
        "theme": "light",
        "primaryColor": "#3b82f6",
        "backgroundColor": "#ffffff",
        "textColor": "#374151"
      },
      "purposes": [
        {
          "id": "essential",
          "name": "Essential Cookies",
          "description": "Required for basic functionality",
          "required": true,
          "category": "essential"
        }
      ],
      "translations": {},
      "createdBy": "admin",
      "organizationId": "org-123",
      "createdAt": "2025-12-15T18:02:11.248Z",
      "updatedAt": "2025-12-15T18:02:11.248Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters

---

#### POST `/api/templates`

Create a new consent template.

**Request Body:**
```json
{
  "name": "Privacy Consent Template",
  "description": "Template for privacy consent collection",
  "status": "active",
  "bannerConfig": {
    "title": "Privacy & Cookie Consent",
    "description": "We use cookies to enhance your experience and analyze our traffic.",
    "acceptButtonText": "Accept All",
    "rejectButtonText": "Reject All",
    "customizeButtonText": "Customize",
    "position": "bottom",
    "theme": "light",
    "primaryColor": "#3b82f6",
    "backgroundColor": "#ffffff",
    "textColor": "#374151"
  },
  "purposes": [
    {
      "id": "essential",
      "name": "Essential Cookies",
      "description": "Required for basic website functionality",
      "required": true,
      "category": "essential"
    },
    {
      "id": "analytics",
      "name": "Analytics",
      "description": "Help us understand website usage",
      "required": false,
      "category": "analytics"
    }
  ],
  "translations": {
    "hi": {
      "title": "गोपनीयता और कुकी सहमति",
      "description": "हम आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं",
      "acceptButtonText": "सभी स्वीकार करें",
      "rejectButtonText": "सभी अस्वीकार करें",
      "customizeButtonText": "अनुकूलित करें",
      "purposes": {
        "essential": {
          "name": "आवश्यक कुकीज़",
          "description": "बुनियादी वेबसाइट कार्यक्षमता के लिए आवश्यक"
        }
      }
    }
  },
  "createdBy": "user-123",
  "organizationId": "org-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "id": "template_1765821731248_2gwkngyp2",
    "name": "Privacy Consent Template",
    // ... full template object
  }
}
```

**Validation Rules:**
- `name`: Required, 1-255 characters
- `bannerConfig.title`: Required, 1-200 characters
- `bannerConfig.description`: Required, 1-500 characters
- `purposes`: Required, minimum 1 purpose
- `purposes[].id`: Required, lowercase alphanumeric with hyphens/underscores
- `bannerConfig.primaryColor`: Required, valid hex color (#RRGGBB)
- `createdBy`: Required, 1-255 characters
- `organizationId`: Required, 1-255 characters

**Status Codes:**
- `201` - Template created successfully
- `400` - Validation error
- `500` - Internal server error

---

#### GET `/api/templates/{id}`

Retrieve a specific template by ID.

**Path Parameters:**
- `id`: Template ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_1765821731248_2gwkngyp2",
    "name": "Privacy Consent Template",
    // ... full template object
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid template ID
- `404` - Template not found

---

#### PUT `/api/templates/{id}`

Update an existing template.

**Path Parameters:**
- `id`: Template ID

**Request Body:** (Partial update supported)
```json
{
  "name": "Updated Template Name",
  "status": "inactive",
  "bannerConfig": {
    "title": "Updated Title"
  },
  "updatedBy": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template updated successfully",
  "data": {
    // ... updated template object
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `404` - Template not found

---

#### DELETE `/api/templates/{id}`

Delete a template.

**Path Parameters:**
- `id`: Template ID

**Query Parameters:**
- `userId`: User performing the deletion

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Template not found

---

### 3. Public Template Access

#### GET `/api/public/templates/{id}`

Retrieve a template for public use (SDK integration). Only returns active templates.

**Path Parameters:**
- `id`: Template ID

**Query Parameters:**
- `language` (optional): Language code (default: "en")
- `platform` (optional): Platform identifier (default: "web")

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_1765821731248_2gwkngyp2",
    "name": "Privacy Consent Template",
    "config": {
      "title": "Privacy & Cookie Consent",
      "description": "We use cookies to enhance your experience",
      "acceptButtonText": "Accept All",
      "rejectButtonText": "Reject All",
      "customizeButtonText": "Customize",
      "position": "bottom",
      "theme": "light",
      "primaryColor": "#3b82f6",
      "backgroundColor": "#ffffff",
      "textColor": "#374151"
    },
    "purposes": [
      {
        "id": "essential",
        "name": "Essential Cookies",
        "description": "Required for basic functionality",
        "required": true,
        "category": "essential"
      }
    ],
    "language": "en",
    "platform": "web",
    "version": "1.0.0"
  }
}
```

**Features:**
- CORS enabled for cross-origin requests
- Automatic translation based on language parameter
- Cached for 5 minutes
- Only serves active templates

**Status Codes:**
- `200` - Success
- `404` - Template not found or inactive
- `400` - Invalid template ID

---

### 4. Consent Collection

#### POST `/api/blutic-svc/api/v1/public/consent-template/update-user`

Submit or update user consent for a specific template.

**Request Body:**
```json
{
  "templateId": "template_1765821731248_2gwkngyp2",
  "userReferenceId": "user-ref-12345",
  "status": "accepted",
  "purposes": ["essential", "analytics"],
  "timestamp": 1734287731000,
  "platform": "web",
  "language": "en"
}
```

**Field Descriptions:**
- `templateId`: ID of the consent template
- `userReferenceId`: Opaque user reference (NO PII - not email/phone)
- `status`: Consent status (`accepted`, `rejected`, `partial`)
- `purposes`: Array of accepted purpose IDs
- `timestamp`: Unix timestamp in milliseconds
- `platform`: Platform identifier (e.g., "web", "mobile")
- `language`: Language code (e.g., "en", "hi")

**Response:**
```json
{
  "success": true,
  "message": "Consent saved successfully",
  "data": {
    "id": "consent_1765822269975_nn403cfjw",
    "templateId": "template_1765821731248_2gwkngyp2",
    "userReferenceId": "user-ref-12345",
    "status": "accepted",
    "purposes": ["essential", "analytics"],
    "timestamp": 1734287731000,
    "platform": "web",
    "language": "en"
  }
}
```

**Validation Rules:**
- `templateId`: Required, must exist and be active
- `userReferenceId`: Required, 1-255 characters, NO PII
- `status`: Required, must be "accepted", "rejected", or "partial"
- `purposes`: Required array
- `platform`: Required, 1-50 characters
- `language`: Required, valid language code (e.g., "en", "hi", "en-US")

**DPDP Compliance:**
- ✅ No PII stored (only opaque user references)
- ✅ Audit trail with IP and user agent
- ✅ Automatic consent expiry handling
- ✅ Version tracking for consent changes

**Status Codes:**
- `200` - Consent saved successfully
- `400` - Validation error or template inactive
- `404` - Template not found
- `500` - Internal server error

---

#### GET `/api/blutic-svc/api/v1/public/consent-template/update-user`

Retrieve consent records (admin use only).

**Query Parameters:**
- `templateId` (optional): Filter by template ID
- `userReferenceId` (optional): Filter by user reference ID

**Note:** At least one filter parameter is required for privacy protection.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "consent_1765822269975_nn403cfjw",
      "templateId": "template_1765821731248_2gwkngyp2",
      "userReferenceId": "user-ref-12345",
      "status": "accepted",
      "acceptedPurposes": ["essential", "analytics"],
      "platform": "web",
      "language": "en",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "consentTimestamp": "2025-12-15T18:15:31.000Z",
      "createdAt": "2025-12-15T18:15:31.248Z",
      "updatedAt": "2025-12-15T18:15:31.248Z",
      "version": 1
    }
  ],
  "total": 1
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing required filter parameters

---

### 5. Analytics

#### GET `/api/analytics/consent`

Get consent analytics and metrics.

**Query Parameters:**
- `templateId` (optional): Filter by template ID
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConsents": 1000,
    "acceptedConsents": 750,
    "rejectedConsents": 200,
    "partialConsents": 50,
    "acceptanceRate": 75.0,
    "breakdown": {
      "byPurpose": {
        "essential": 1000,
        "analytics": 600,
        "marketing": 400
      },
      "byPlatform": {
        "web": 800,
        "mobile": 200
      },
      "byLanguage": {
        "en": 700,
        "hi": 300
      }
    }
  }
}
```

---

### 6. Testing Endpoints

#### POST `/api/test-flow`

Complete end-to-end flow test (development only).

**Response:**
```json
{
  "success": true,
  "message": "Complete flow test successful",
  "data": {
    "template": {
      "id": "template_1765822292927_krrn3tj3z",
      "name": "Complete Flow Test Template",
      "status": "active"
    },
    "consent": {
      "id": "consent_1765822292928_11kjmya76",
      "status": "accepted",
      "purposes": ["essential", "analytics"]
    },
    "analytics": {
      "totalConsents": 1,
      "acceptedConsents": 1,
      "rejectedConsents": 0,
      "partialConsents": 0,
      "acceptanceRate": 100
    },
    "embedScript": "<!-- DPDP Consent Manager SDK -->\n<script src=\"http://localhost:3000/sdk/consent-manager.js\" data-template-id=\"template_1765822292927_krrn3tj3z\" data-user-id=\"CLIENT_USER_REFERENCE_ID\" data-platform=\"web\" defer></script>"
  }
}
```

---

## SDK Integration

### JavaScript SDK

Include the SDK in your website:

```html
<!-- DPDP Consent Manager SDK -->
<script 
  src="https://your-domain.com/sdk/consent-manager.js"
  data-template-id="YOUR_TEMPLATE_ID"
  data-user-id="USER_REFERENCE_ID"
  data-platform="web"
  data-language="en"
  defer>
</script>
```

**SDK Configuration:**
- `data-template-id`: Required - Template ID from API
- `data-user-id`: Required - Opaque user reference (NO PII)
- `data-platform`: Optional - Platform identifier (default: "web")
- `data-language`: Optional - Language code (default: "en")

**SDK API:**
```javascript
// Check if SDK is loaded
if (window.DPDPConsentManager) {
  // Show banner manually
  window.DPDPConsentManager.showBanner();
  
  // Hide banner
  window.DPDPConsentManager.hideBanner();
  
  // Update language
  window.DPDPConsentManager.updateLanguage('hi');
  
  // Get SDK info
  console.log(window.DPDPConsentManager.version);
  console.log(window.DPDPConsentManager.config);
}
```

**Event Listening:**
```javascript
window.addEventListener('message', function(event) {
  if (event.origin !== window.location.origin) return;
  
  if (event.data.type === 'CONSENT_ACTION') {
    console.log('Consent status:', event.data.payload.status);
    console.log('Accepted purposes:', event.data.payload.purposes);
  }
});
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Template ID is required",
  "details": ["Field 'templateId' is required"]
}
```

### Error Types

1. **Validation Error (400)**
   - Invalid input data
   - Missing required fields
   - Format violations

2. **Not Found Error (404)**
   - Template not found
   - Resource doesn't exist

3. **Conflict Error (409)**
   - Duplicate resources
   - Business logic violations

4. **Internal Server Error (500)**
   - Database connectivity issues
   - Unexpected system errors

---

## Rate Limiting

- **Template Management**: 100 requests/minute per IP
- **Consent Collection**: 1000 requests/minute per IP
- **Public Template Access**: 500 requests/minute per IP

---

## CORS Policy

The API supports cross-origin requests for:
- Public template endpoints
- Consent collection endpoints
- SDK-related endpoints

**Allowed Origins:** Configurable per environment
**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
**Allowed Headers:** Content-Type, Authorization

---

## Data Retention

- **Templates**: Retained indefinitely unless explicitly deleted
- **Consent Records**: Retained per DPDP Act requirements
- **Audit Logs**: Retained for 7 years
- **Analytics Data**: Aggregated data retained indefinitely

---

## Security Considerations

1. **PII Protection**: Never store email, phone, or personal identifiers
2. **Input Validation**: All inputs validated and sanitized
3. **Audit Trail**: All actions logged with timestamps and user context
4. **HTTPS Only**: All production endpoints require HTTPS
5. **CORS**: Properly configured for cross-origin security

---

## Monitoring & Logging

### Health Monitoring
- Use `/api/health` for system health checks
- Monitor response times and error rates
- Set up alerts for 5xx errors

### Audit Logging
- All consent actions logged
- Template modifications tracked
- User actions recorded (without PII)

### Metrics
- Consent acceptance rates
- Template usage statistics
- Platform and language distribution

---

## Support

For technical support or questions about the API:
- Check the health endpoint first
- Review error messages and status codes
- Use test endpoints for debugging
- Ensure DPDP compliance in all implementations

---

## Changelog

### Version 1.0.0
- Initial API release
- Template management endpoints
- Consent collection system
- SDK integration support
- DPDP compliance features