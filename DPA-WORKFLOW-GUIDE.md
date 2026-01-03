# DPA Upload & Management Workflow Guide

## 🎯 Overview

This guide explains the complete **Data Processing Agreement (DPA) workflow** in your DPDP Consent Manager. The process is designed to be **segregated, clear, and compliant** with DPDP Act requirements.

## 📋 Complete DPA Workflow

### **Phase 1: Vendor Creation**
1. **Navigate**: Vendor Management > Vendor Overview
2. **Create Vendor**: Click "Add Vendor" button
3. **Fill Details**: Name, category, contact information
4. **Status**: Vendor created with `DPA_STATUS = PENDING`
5. **Result**: Vendor cannot access any data until DPA is approved

### **Phase 2: DPA Document Management**
1. **Navigate**: Vendor Management > DPA Management
2. **Select Vendor**: Choose vendor from the DPA dashboard
3. **Start Process**: Click "Manage" to enter DPA workflow

#### **Step 1: Document Upload**
- **Drag & Drop**: PDF files directly into upload area
- **File Validation**: 
  - PDF format only
  - Maximum 10MB file size
  - Automatic virus scanning (if configured)
- **Storage**: Secure storage in `/public/uploads/dpa/`
- **Naming**: Auto-generated unique filenames

#### **Step 2: Document Review**
- **Preview**: View uploaded PDF inline
- **Download**: Download for offline review
- **Replace**: Option to delete and re-upload
- **Validation**: Ensure document completeness

#### **Step 3: Legal Approval**
- **Review Document**: Legal team reviews DPA content
- **Set Dates**: 
  - DPA Signed Date (when both parties signed)
  - Valid Until Date (expiry date)
- **Approve/Reject**: Final decision with audit trail

#### **Step 4: Completion**
- **Status Update**: `DPA_STATUS = APPROVED`
- **Data Access**: Vendor can now access data per permissions
- **Notifications**: Automatic alerts for stakeholders

### **Phase 3: Ongoing Management**
1. **Monitor Expiry**: Track DPA expiration dates
2. **Renewal Process**: Automated alerts 30 days before expiry
3. **Compliance Reporting**: Export DPA status reports
4. **Audit Trail**: Complete history of all DPA activities

## 🔐 Security & Compliance Features

### **File Security**
- **Encryption**: Files encrypted at rest
- **Access Control**: Role-based document access
- **Audit Logging**: Every file access logged
- **Backup**: Automatic document backup

### **DPDP Compliance**
- **Legal Requirements**: Ensures all DPDP Act clauses
- **Data Minimization**: Vendor access limited to approved data types
- **Purpose Limitation**: Access restricted to approved purposes
- **Retention Limits**: Automatic expiry enforcement

### **Audit Trail**
- **Document Upload**: Who, when, what file
- **Approval Process**: Legal reviewer, dates, decisions
- **Access Attempts**: Every data access logged
- **Status Changes**: Complete change history

## 🎛️ User Interface Flow

### **DPA Management Dashboard**
```
📊 Stats Cards
├── Total DPAs: 15
├── Approved: 12
├── Pending: 2
├── Expiring Soon: 1
└── With Documents: 14

🔍 Quick Actions
├── Upload New DPA (filters to pending vendors)
├── Review Expiry Dates (shows expiring DPAs)
└── Export DPA Report (compliance report)

📋 DPA Status Table
├── Vendor Name & Category
├── DPA Status Badge
├── Document Status (uploaded/missing)
├── Signed Date
├── Expiry Date
├── Expiry Status (with color coding)
└── Actions (Manage, View Document)
```

### **DPA Upload Flow**
```
🔄 Progress Steps
Step 1: Upload Document
├── Drag & drop area
├── File validation
├── Progress indicator
└── Success confirmation

Step 2: Document Review
├── PDF preview
├── Download option
├── Replace option
└── Proceed to approval

Step 3: Legal Approval
├── Document review interface
├── Date selection (signed, expiry)
├── Approve/Reject buttons
└── Legal compliance checklist

Step 4: Completion
├── Success confirmation
├── Status summary
├── Document access
└── Next steps guidance
```

## 📊 Reporting & Analytics

### **DPA Status Reports**
- **Compliance Dashboard**: Real-time DPA status overview
- **Expiry Alerts**: Automated notifications for renewals
- **Audit Reports**: Complete DPA lifecycle reports
- **Export Options**: CSV/JSON formats for external systems

### **Key Metrics**
- **Approval Rate**: % of DPAs approved vs rejected
- **Processing Time**: Average time from upload to approval
- **Expiry Tracking**: DPAs expiring in next 30/60/90 days
- **Compliance Score**: Overall DPA compliance percentage

## 🚨 Alert System

### **Expiry Notifications**
- **90 Days**: Early warning to legal team
- **30 Days**: Urgent renewal required
- **7 Days**: Critical - immediate action needed
- **Expired**: Automatic data access suspension

### **Compliance Alerts**
- **Missing DPAs**: Vendors without uploaded documents
- **Rejected DPAs**: Vendors requiring new agreements
- **Invalid Documents**: Files that failed validation
- **Access Violations**: Attempts to access data without valid DPA

## 🔧 Integration Points

### **With Consent Manager SDK**
```javascript
// Before any data sharing
const dpaCheck = await fetch('/api/vendors/access-check', {
  method: 'POST',
  body: JSON.stringify({
    vendor_id: 'vendor_123',
    purpose: 'analytics',
    data_types: ['name', 'email']
  })
})

if (!dpaCheck.access_granted) {
  // Block data sharing
  console.log('DPA not approved:', dpaCheck.reason)
}
```

### **With External Systems**
- **CRM Integration**: Sync vendor DPA status
- **Legal Management**: Export for legal review systems
- **Compliance Tools**: API endpoints for audit systems
- **Notification Systems**: Webhook alerts for expiry

## 📝 Best Practices

### **For Legal Teams**
1. **Review Checklist**: Ensure all DPDP clauses present
2. **Date Accuracy**: Verify signing and expiry dates
3. **Version Control**: Track DPA document versions
4. **Renewal Planning**: Set calendar reminders

### **For Compliance Teams**
1. **Regular Audits**: Monthly DPA status reviews
2. **Expiry Monitoring**: Weekly expiry date checks
3. **Access Logging**: Review vendor access patterns
4. **Report Generation**: Quarterly compliance reports

### **For IT Teams**
1. **File Management**: Regular backup verification
2. **Security Updates**: Keep upload system secure
3. **Performance Monitoring**: Track upload/approval times
4. **Integration Testing**: Verify API endpoints

## 🎯 Success Metrics

### **Operational Efficiency**
- **Upload Success Rate**: >99% successful uploads
- **Processing Time**: <48 hours from upload to approval
- **User Satisfaction**: Intuitive workflow experience
- **Error Rate**: <1% failed uploads or approvals

### **Compliance Effectiveness**
- **DPA Coverage**: 100% of active vendors have valid DPAs
- **Expiry Management**: 0 expired DPAs in production
- **Audit Readiness**: Complete audit trail available
- **Regulatory Compliance**: Full DPDP Act adherence

## 🚀 Getting Started

### **Quick Start**
1. **Access**: Navigate to Vendor Management > DPA Management
2. **Upload**: Select a pending vendor and start DPA process
3. **Review**: Follow the 4-step guided workflow
4. **Monitor**: Use dashboard to track all DPA statuses

### **Training Resources**
- **Video Walkthrough**: Step-by-step process demonstration
- **User Manual**: Detailed feature documentation
- **FAQ**: Common questions and troubleshooting
- **Support**: Help desk for technical issues

---

**This segregated DPA workflow ensures complete DPDP compliance while maintaining an intuitive user experience for all stakeholders.**