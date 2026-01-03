# Purpose Management System Guide

## Overview

The Purpose Management system allows you to create, manage, and organize consent purposes that can be used across your consent templates. This centralized approach ensures consistency and compliance with DPDP regulations.

## Features

### 🎯 **Purpose Categories**
- **Essential**: Required for website functionality (security, network management)
- **Analytics**: Performance monitoring and website optimization
- **Marketing**: Advertising, promotional content, and campaign tracking
- **Personalization**: User preferences and customized experiences
- **Other**: Additional purposes not covered by standard categories

### 📋 **Purpose Properties**
Each purpose includes:
- **Name**: Clear, descriptive purpose name
- **Description**: Detailed explanation of data usage
- **Category**: Classification for organization
- **Required Status**: Whether consent is mandatory
- **Active Status**: Enable/disable purposes
- **Usage Tracking**: See which templates use each purpose

## Creating Purposes

### Method 1: Purpose Management Dashboard
1. Navigate to **Consent > Purposes** in the sidebar
2. Click **Add Purpose** button
3. Fill in purpose details:
   - Purpose name (e.g., "Analytics & Performance")
   - Select appropriate category
   - Write clear description
   - Set required/optional status
   - Enable/disable the purpose
4. Click **Create Purpose**

### Method 2: From Notice Banner Config
1. Go to **Consent > Notice Banner**
2. In the Purposes section, click **Add Purpose**
3. Choose **Create Custom** tab
4. Fill in all required fields:
   - **Purpose Name**: Descriptive name
   - **Mark as Mandatory**: Check if required
   - **Data Fields**: Select applicable data types (Name, Email, Phone, Address, DOB)
   - **Third Party Sources**: List external services (comma-separated)
   - **Platforms**: Select Web, Mobile, and/or Tablet
   - **Description**: Explain data collection purpose
   - **Validity**: Set consent duration in days
5. Click **Create Purpose**

## Using Existing Purposes

### In Notice Banner Config
1. Go to **Consent > Notice Banner**
2. Click **Add Purpose** in the Purposes section
3. Select **Select Existing** tab
4. Choose from available purposes dropdown
5. Review purpose details in the preview
6. Click **Add Selected Purpose**

### Purpose Integration
- Purposes created in the management system automatically appear in dropdowns
- Templates can reuse purposes across different consent banners
- Changes to purpose descriptions update across all templates

## Purpose Management Features

### Dashboard Overview
- **Total Purposes**: Count of all created purposes
- **Active Purposes**: Currently enabled purposes
- **Required Purposes**: Mandatory consent purposes
- **Category Distribution**: Visual breakdown by category

### Purpose Operations
- **Edit**: Modify purpose details and settings
- **Delete**: Remove unused purposes (with usage warnings)
- **Activate/Deactivate**: Enable or disable purposes
- **Search & Filter**: Find purposes by name or category

### Usage Tracking
- See which templates use each purpose
- Prevent deletion of purposes in active use
- Track purpose adoption across templates

## Best Practices

### 1. Purpose Naming
- Use clear, user-friendly names
- Avoid technical jargon
- Be specific about data usage
- Examples:
  - ✅ "Website Analytics & Performance"
  - ✅ "Marketing Communications"
  - ❌ "Data Processing Type A"
  - ❌ "Cookie Category 2"

### 2. Descriptions
- Explain what data is collected
- Describe how data is used
- Mention third-party sharing if applicable
- Keep language simple and transparent

### 3. Categories
- **Essential**: Only for truly necessary functions
- **Analytics**: Performance and usage monitoring
- **Marketing**: Promotional and advertising purposes
- **Personalization**: User experience customization
- **Other**: Specific business needs

### 4. Required vs Optional
- Mark as required only when absolutely necessary
- Most purposes should be optional for user choice
- Essential functions can be required
- Consider user experience impact

## DPDP Compliance

### Legal Requirements
- **Clear Purpose**: Each purpose must have clear description
- **Specific Use**: Purposes should be specific, not broad
- **User Control**: Users must be able to accept/reject optional purposes
- **Transparency**: Full disclosure of data usage

### Data Minimization
- Only collect data necessary for stated purpose
- Set appropriate validity periods
- Regular review of purpose necessity
- Remove unused or outdated purposes

### Consent Management
- Separate consent for each purpose
- Allow granular control
- Respect user choices
- Maintain consent records

## API Integration

### Purpose Endpoints
```bash
# Get all purposes
GET /api/purposes

# Create new purpose
POST /api/purposes
{
  "name": "Analytics & Performance",
  "description": "Monitor website performance and user behavior",
  "category": "analytics",
  "required": false,
  "isActive": true
}

# Update purpose
PUT /api/purposes/{id}

# Delete purpose
DELETE /api/purposes/{id}
```

### Template Integration
Purposes automatically integrate with:
- Notice Banner Configuration
- Consent Template Creation
- SDK Implementation
- Consent Collection APIs

## Troubleshooting

### Common Issues

#### 1. Purpose Not Appearing in Dropdown
- Check if purpose is marked as active
- Refresh the page or reload purposes
- Verify purpose was saved successfully

#### 2. Cannot Delete Purpose
- Purpose may be in use by active templates
- Check usage count in purpose management
- Deactivate templates first, then delete purpose

#### 3. Duplicate Purposes
- Use search to check existing purposes
- Consider editing existing purpose instead
- Maintain consistent naming conventions

### Error Messages
- **"Purpose name required"**: Enter a descriptive name
- **"Description required"**: Add clear purpose description
- **"Purpose in use"**: Cannot delete purpose used by templates
- **"Invalid category"**: Select from available categories

## Migration Guide

### From Hardcoded Purposes
1. **Audit Existing**: List all current purposes in templates
2. **Create Purposes**: Add each unique purpose to management system
3. **Update Templates**: Replace hardcoded purposes with managed ones
4. **Test Integration**: Verify all templates work correctly
5. **Remove Old Code**: Clean up hardcoded purpose definitions

### Data Migration
```javascript
// Example migration script
const existingPurposes = [
  { name: "Analytics", description: "...", category: "analytics" },
  { name: "Marketing", description: "...", category: "marketing" }
]

for (const purpose of existingPurposes) {
  await fetch('/api/purposes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purpose)
  })
}
```

## Advanced Features

### Bulk Operations
- Import purposes from CSV
- Export purpose definitions
- Bulk activate/deactivate
- Mass category updates

### Template Synchronization
- Automatic purpose updates across templates
- Version control for purpose changes
- Template impact analysis
- Rollback capabilities

### Compliance Reporting
- Purpose usage analytics
- Consent collection rates by purpose
- Compliance audit trails
- Regulatory reporting exports

---

**Last Updated**: December 2024  
**Version**: 1.0  
**System**: DPDP Consent Manager