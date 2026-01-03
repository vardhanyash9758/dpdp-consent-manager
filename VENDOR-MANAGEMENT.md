# Vendor Management System - DPDP Compliance

## Overview

This vendor management system ensures DPDP Act compliance by controlling which vendors can access personal data and under what conditions.

## 🔐 Core Security Principle

**NO VENDOR CAN ACCESS PERSONAL DATA UNLESS:**
1. ✅ DPA Status = APPROVED
2. ✅ Purpose is explicitly allowed
3. ✅ Data type is explicitly permitted
4. ✅ User consent exists for that purpose

## 📋 Features

### 1. Vendor Overview
- **Dashboard**: Total vendors, approved count, pending DPAs, high-risk vendors
- **Vendor List**: Searchable table with status, risk level, and actions
- **Quick Actions**: Approve/Reject DPA, Upload documents, View details

### 2. Vendor Assessment  
- **Purpose Mapping**: Control what purposes vendor can process data for
- **Data Access Scope**: Toggle specific data types (Name, Email, Aadhaar, etc.)
- **Risk Assessment**: Auto-calculated based on category and data sensitivity
- **Audit Logs**: Complete history of access attempts

## 🚀 Getting Started

### 1. Start Your Application
```bash
npm run dev
```

### 2. Add Sample Data
```bash
node scripts/seed-vendor-data.js
```

### 3. Navigate to Vendor Management
- Go to **Vendor Management > Vendor Overview** in the sidebar
- View the vendor dashboard and statistics
- Create new vendors or manage existing ones

### 4. Manage Individual Vendors
- Click "View" on any vendor to see detailed information
- Upload DPA documents (PDF only, max 10MB)
- Approve/reject DPA agreements with custom dates
- Edit vendor information and contact details

### 5. Configure Vendor Access
- Go to **Vendor Management > Vendor Assessment**
- Select a vendor from the dropdown
- Configure allowed purposes and data types
- Monitor access logs and compliance

### 6. DPA Management Workflow
- Go to **Vendor Management > DPA Management**
- Use the segregated 4-step DPA upload process:
  1. **Upload Document**: Drag & drop PDF files (max 10MB)
  2. **Document Review**: Preview and validate uploaded DPA
  3. **Legal Approval**: Set signing dates and approve/reject
  4. **Completion**: Vendor gains data access per permissions
- Monitor DPA expiry dates and renewal alerts

### 7. Bulk Operations & Export
- Select multiple vendors using checkboxes
- Perform bulk approve/reject operations
- Export vendor data as CSV or JSON with access logs

## 📊 API Endpoints

### Vendor CRUD
- `GET /api/vendors` - List all vendors with stats
- `POST /api/vendors` - Create new vendor
- `GET /api/vendors/[id]` - Get vendor details with access logs
- `PUT /api/vendors/[id]` - Update vendor configuration
- `DELETE /api/vendors/[id]` - Delete vendor

### DPA Management
- `POST /api/vendors/[id]/approve` - Approve vendor DPA
- `DELETE /api/vendors/[id]/approve` - Reject vendor DPA

### Access Control
- `POST /api/vendors/access-check` - Check if vendor can access data (logs attempt)

### File Management
- `POST /api/vendors/[id]/upload-dpa` - Upload DPA document (PDF only)

### Bulk Operations
- `POST /api/vendors/bulk-actions` - Perform bulk approve/reject/activate/deactivate

### Data Export
- `GET /api/vendors/export?format=csv&include_logs=true` - Export vendor data

## 🔍 Risk Level Calculation

### HIGH RISK
- Category: KYC or Payments
- Has access to sensitive data (Aadhaar, PAN)
- DPA not approved

### MEDIUM RISK  
- Has access to personal data (Name, Email, Phone, Address)
- No sensitive data access

### LOW RISK
- Non-personal or minimal data access
- Infrastructure/device data only

## 🛡️ Enforcement Rules

### Runtime Access Check
```javascript
// This logic is enforced in /api/vendors/access-check
function canVendorAccessData(vendor, purpose, dataTypes) {
  if (vendor.dpa_status !== 'APPROVED') return false
  if (!vendor.allowed_purposes.includes(purpose)) return false
  if (!vendor.allowed_data_types.includes(dataType)) return false
  return true
}
```

### DPA Status Rules
- **PENDING**: Cannot access any data (default for new vendors)
- **APPROVED**: Can access data per configured permissions
- **EXPIRED**: Access automatically blocked
- **REJECTED**: Access permanently blocked

## 📈 Monitoring & Compliance

### Audit Trail
- Every access attempt is logged
- Includes vendor, purpose, data types, and result
- Required for DPDP compliance audits

### Dashboard Metrics
- Total vendors and approval status
- High-risk vendor count
- Pending DPA approvals
- Recent access activity

## 🔧 Integration

### With Consent Manager SDK
The vendor access check should be integrated into your consent manager:

```javascript
// Before sharing data with any vendor
const canAccess = await fetch('/api/vendors/access-check', {
  method: 'POST',
  body: JSON.stringify({
    vendor_id: 'vendor_123',
    purpose: 'analytics',
    data_types: ['name', 'email']
  })
})

if (!canAccess.access_granted) {
  // Block data sharing and log the attempt
  console.log('Vendor access denied:', canAccess.reason)
}
```

## 📝 Data Model

### Vendor
```typescript
interface Vendor {
  vendor_id: string
  vendor_name: string
  category: 'analytics' | 'kyc' | 'messaging' | 'infra' | 'payments' | 'other'
  contact_name: string
  contact_email: string
  
  dpa_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  dpa_file_url?: string
  dpa_signed_on?: Date
  dpa_valid_till?: Date
  
  allowed_purposes: Purpose[]
  allowed_data_types: DataType[]
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  
  is_active: boolean
  created_at: Date
  updated_at: Date
}
```

### Access Log
```typescript
interface VendorAccessLog {
  log_id: string
  vendor_id: string
  vendor_name: string
  purpose: Purpose
  data_types_requested: DataType[]
  access_granted: boolean
  reason?: string
  timestamp: Date
}
```

## 🎯 Next Steps

1. **File Upload**: Add DPA document upload functionality
2. **Notifications**: Alert when DPAs are expiring
3. **Bulk Operations**: Approve/reject multiple vendors
4. **Advanced Filtering**: Filter by risk level, category, etc.
5. **Export**: Export vendor list and audit logs
6. **Integration**: Connect with actual data processing systems

## 🚨 Important Notes

- This system is designed for DPDP Act compliance
- All vendor access must be logged for audit purposes
- DPA approval is mandatory before any data access
- Risk levels are auto-calculated and should not be manually overridden
- The enforcement logic must be implemented server-side, not just in UI