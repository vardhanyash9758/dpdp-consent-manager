# DPDP Consent Manager - Production Deployment Guide

## 🚀 Production Checklist

### 1. Domain & HTTPS Setup
```bash
# Your production domains should be:
# Dashboard: https://dashboard.yourdomain.com
# SDK & API: https://consent-manager.yourdomain.com
```

**Critical Requirements:**
- ✅ HTTPS enforced on all domains
- ✅ Valid SSL certificates
- ✅ CORS properly configured
- ✅ CDN for SDK distribution (optional but recommended)

### 2. SDK Configuration

**Development (localhost):**
```html
<script 
  src="http://localhost:3000/sdk/consent-manager.js"
  data-template-id="template_123"
  data-user-id="user_ref_456"
  data-platform="web"
  defer>
</script>
```

**Production:**
```html
<script 
  src="https://consent-manager.yourdomain.com/sdk/consent-manager.js"
  data-template-id="template_123"
  data-user-id="user_ref_456"
  data-platform="web"
  defer>
</script>
```

### 3. Environment Variables

Create `.env.production`:
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/consent_db

# API URLs
NEXT_PUBLIC_API_BASE_URL=https://consent-manager.yourdomain.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.yourdomain.com

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-char-encryption-key

# CORS Origins
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 4. Database Setup

The system now uses PostgreSQL with automated migration scripts:

**Step 1: Set Database URL**
```bash
# Add to .env.local or .env.production
DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
```

**Step 2: Run Migration**
```bash
# Automatically creates all tables, indexes, and views
npm run db:setup
```

**What gets created:**
- ✅ 8 core tables (consent_templates, consent_purposes, vendors, etc.)
- ✅ Performance indexes for all high-frequency queries  
- ✅ Database views for analytics
- ✅ Audit triggers for compliance
- ✅ ENUM types for data validation

**Step 3: Verify Setup**
```bash
# Test database connection
curl http://localhost:3000/api/purposes
# Should return: {"success":true,"data":[]}
```

**Manual Migration (if needed):**
The migration script is located at `lib/database/migrations/001_initial_schema.sql` and can be run manually if needed.

### 5. Security Configuration

**CORS Setup** (`next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/public/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        source: '/sdk/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=31536000' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 6. Monitoring & Logging

**Add to your API routes:**
```javascript
// Log all consent actions
console.log('[AUDIT]', {
  action: 'consent_collected',
  templateId,
  userReferenceId,
  status,
  timestamp: new Date().toISOString(),
  ip: clientIP,
  userAgent
});
```

**Recommended monitoring:**
- Consent collection rates
- API response times
- Error rates
- Template usage statistics

### 7. GDPR/DPDP Compliance Checklist

- ✅ **No PII in user reference IDs**
- ✅ **Consent records include timestamps**
- ✅ **Audit trail for all changes**
- ✅ **Data retention policies implemented**
- ✅ **Right to withdraw consent**
- ✅ **Data export capabilities**
- ✅ **Secure data transmission (HTTPS)**

### 8. Testing in Production

**Test Script for Production:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Production Test</title>
</head>
<body>
    <h1>Production Consent Test</h1>
    
    <!-- Your production SDK -->
    <script 
      src="https://consent-manager.yourdomain.com/sdk/consent-manager.js"
      data-template-id="your-template-id"
      data-user-id="test-user-123"
      data-platform="web"
      defer>
    </script>
    
    <script>
      // Listen for consent events
      window.addEventListener('dpdp-consent-saved', function(event) {
        console.log('Consent saved:', event.detail);
        alert('Consent saved successfully!');
      });
      
      window.addEventListener('dpdp-consent-error', function(event) {
        console.error('Consent error:', event.detail);
        alert('Consent save failed!');
      });
    </script>
</body>
</html>
```

### 9. Performance Optimization

**CDN Configuration:**
```javascript
// Serve SDK from CDN
const SDK_CDN_URL = 'https://cdn.yourdomain.com/consent-manager/v1.0.0/consent-manager.js';
```

**Caching Strategy:**
- SDK files: 1 year cache
- Template data: 5 minutes cache
- Consent API: No cache

### 10. Backup & Recovery

**Database Backups:**
```bash
# Daily backup
pg_dump consent_db > backup_$(date +%Y%m%d).sql

# Restore
psql consent_db < backup_20241215.sql
```

**Template Export:**
```javascript
// Export all templates
GET /api/templates?export=true
```

## 🔒 Security Best Practices

1. **Never log PII** - Only log template IDs and user reference IDs
2. **Validate all inputs** - Sanitize template configurations
3. **Rate limiting** - Prevent abuse of consent APIs
4. **Regular security audits** - Review access logs
5. **Encrypt sensitive data** - Use encryption for stored configurations

## 📊 Monitoring Dashboard

Track these metrics:
- Total consent requests
- Acceptance rates by template
- Geographic distribution
- Device/platform breakdown
- API response times
- Error rates

## 🚨 Incident Response

**If consent collection fails:**
1. Check API logs
2. Verify template exists and is active
3. Test SDK loading
4. Check CORS configuration
5. Validate database connectivity

**Emergency contacts:**
- Technical lead: [email]
- Compliance officer: [email]
- Legal team: [email]

---

## Quick Deployment Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Check health
curl https://consent-manager.yourdomain.com/api/health

# Test SDK
curl https://consent-manager.yourdomain.com/sdk/consent-manager.js
```

Your DPDP Consent Manager is now production-ready! 🎉