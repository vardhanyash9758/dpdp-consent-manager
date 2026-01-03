# SDK Integration Guide - DPDP Consent Manager

## 🎯 Quick Start

### **Step 1: Create Your Consent Template**
1. Go to **Notice Banner Config** in your dashboard
2. Configure your banner text, colors, and purposes
3. Click **"Save as Template"**
4. Copy the Template ID from the success message

### **Step 2: Embed the SDK Script**
Add this script to your website's HTML `<head>` section:

```html
<script 
  src="https://your-domain.com/sdk/consent-manager.js"
  data-template-id="YOUR_TEMPLATE_ID"
  data-user-id="YOUR_USER_REFERENCE_ID"
  data-platform="web"
  data-language="en"
  defer>
</script>
```

### **Step 3: Test Your Integration**
1. Open your website
2. The consent banner should appear automatically
3. Test the accept/reject/customize functionality

## 🔧 Configuration Options

### **Required Parameters**
- `data-template-id`: Your template ID from the dashboard
- `data-user-id`: Unique, opaque user reference (NOT email/phone)

### **Optional Parameters**
- `data-platform`: `web` (default), `mobile`, `app`
- `data-language`: `en` (default), `hi`, `es`, `fr`, etc.

### **Example Configurations**

#### **Basic Website Integration**
```html
<script 
  src="/sdk/consent-manager.js"
  data-template-id="template_1234567890_abcdefghi"
  data-user-id="user_12345"
  data-platform="web"
  defer>
</script>
```

#### **Multi-language Support**
```html
<script 
  src="/sdk/consent-manager.js"
  data-template-id="template_1234567890_abcdefghi"
  data-user-id="user_12345"
  data-language="hi"
  defer>
</script>
```

#### **Mobile App Integration**
```html
<script 
  src="/sdk/consent-manager.js"
  data-template-id="template_1234567890_abcdefghi"
  data-user-id="user_12345"
  data-platform="mobile"
  defer>
</script>
```

## 🎨 Customization

### **Template Configuration**
All visual customization is done through the **Notice Banner Config** dashboard:

- **Colors**: Primary color, background, text colors
- **Text**: Title, description, button labels
- **Position**: Top, bottom, or center placement
- **Purposes**: Define what data you collect and why
- **Languages**: Multi-language support

### **Runtime Customization**
```javascript
// Show banner manually
window.DPDPConsentManager.showBanner();

// Hide banner
window.DPDPConsentManager.hideBanner();

// Change language dynamically
window.DPDPConsentManager.updateLanguage('hi');

// Check SDK status
console.log(window.DPDPConsentManager.config);
```

## 📊 Data Flow

### **1. User Interaction**
```
User visits website → SDK loads → Banner appears → User makes choice
```

### **2. Consent Processing**
```
User choice → SDK validates → Sends to API → Stores consent → Hides banner
```

### **3. Data Structure**
```json
{
  "templateId": "template_123",
  "userReferenceId": "user_456",
  "status": "accepted|rejected|partial",
  "purposes": ["analytics", "marketing"],
  "timestamp": 1640995200000,
  "platform": "web",
  "language": "en"
}
```

## 🔐 Security & Privacy

### **User ID Guidelines**
✅ **Good Examples:**
- `user_12345`
- `customer_abc123`
- `session_xyz789`

❌ **Bad Examples (PII):**
- `john.doe@email.com`
- `+1-555-123-4567`
- `john_doe_1990`

### **Data Protection**
- All consent data is encrypted in transit
- No PII is stored in consent records
- User IDs are opaque references only
- Full audit trail for compliance

## 🧪 Testing Your Integration

### **1. Use the Test Page**
Visit `/test-sdk.html` on your domain to:
- Select your template
- Test the SDK integration
- View console logs
- Debug any issues

### **2. Manual Testing Checklist**
- [ ] Banner appears on page load
- [ ] Accept All works correctly
- [ ] Reject All works correctly
- [ ] Customize preferences works
- [ ] Language switching works
- [ ] Banner hides after consent
- [ ] Console shows no errors

### **3. Network Testing**
Check browser DevTools Network tab:
- [ ] SDK script loads successfully
- [ ] Template data fetches correctly
- [ ] Consent POST request succeeds
- [ ] No 404 or 500 errors

## 🚨 Troubleshooting

### **Banner Not Appearing**
1. **Check Template ID**: Ensure it exists and is active
2. **Check Console**: Look for SDK error messages
3. **Check Network**: Verify script and API calls succeed
4. **Check User ID**: Ensure it's not PII (triggers warnings)

### **Template Not Loading**
1. **Verify Template Status**: Must be `active` in dashboard
2. **Check API Endpoint**: `/api/public/templates/[id]` should return data
3. **Check CORS**: Ensure cross-origin requests are allowed

### **Consent Not Saving**
1. **Check API Endpoint**: `/api/blutic-svc/api/v1/public/consent-template/update-user`
2. **Verify Payload**: Check request body in Network tab
3. **Check Server Logs**: Look for backend errors

### **Common Error Messages**

#### `Template not found`
- Template ID is incorrect or template was deleted
- Template status is not `active`

#### `Missing required configuration`
- `data-template-id` or `data-user-id` is missing
- Check script tag attributes

#### `Failed to save consent`
- Backend API is not responding
- Network connectivity issues
- Server configuration problems

## 🔄 Integration Patterns

### **Single Page Applications (SPA)**
```javascript
// For React, Vue, Angular apps
useEffect(() => {
  // Load SDK dynamically
  const script = document.createElement('script');
  script.src = '/sdk/consent-manager.js';
  script.setAttribute('data-template-id', templateId);
  script.setAttribute('data-user-id', userId);
  script.defer = true;
  document.head.appendChild(script);
  
  return () => {
    // Cleanup on unmount
    document.head.removeChild(script);
    delete window.DPDPConsentManager;
  };
}, [templateId, userId]);
```

### **E-commerce Integration**
```html
<!-- Different templates for different sections -->
<script 
  src="/sdk/consent-manager.js"
  data-template-id="template_ecommerce_main"
  data-user-id="customer_12345"
  data-platform="web"
  defer>
</script>
```

### **Multi-tenant Applications**
```javascript
// Dynamic template selection
const templateId = getTemplateForTenant(tenantId);
const script = document.createElement('script');
script.src = '/sdk/consent-manager.js';
script.setAttribute('data-template-id', templateId);
script.setAttribute('data-user-id', userId);
document.head.appendChild(script);
```

## 📈 Analytics Integration

### **Google Analytics**
```javascript
// Wait for consent before initializing GA
window.addEventListener('message', (event) => {
  if (event.data.type === 'CONSENT_ACTION') {
    const { purposes } = event.data.payload;
    if (purposes.includes('analytics')) {
      // Initialize Google Analytics
      gtag('config', 'GA_MEASUREMENT_ID');
    }
  }
});
```

### **Custom Analytics**
```javascript
// Track consent events
window.addEventListener('message', (event) => {
  if (event.data.type === 'CONSENT_ACTION') {
    // Send to your analytics
    analytics.track('consent_given', {
      status: event.data.payload.status,
      purposes: event.data.payload.purposes
    });
  }
});
```

## 🎯 Best Practices

### **Performance**
- Use `defer` attribute on script tag
- Load SDK after critical page content
- Consider lazy loading for non-essential pages

### **User Experience**
- Test on mobile devices
- Ensure banner doesn't block important content
- Provide clear, simple language
- Respect user's previous choices

### **Compliance**
- Regular template updates for legal changes
- Monitor consent collection rates
- Maintain audit logs
- Respect user withdrawal requests

### **Development**
- Use test templates in development
- Implement proper error handling
- Monitor SDK performance
- Keep templates synchronized across environments

## 🔗 API Reference

### **SDK Methods**
```javascript
// Global SDK object
window.DPDPConsentManager = {
  version: "1.0.0",
  config: { templateId, userId, platform, language },
  showBanner: () => void,
  hideBanner: () => void,
  updateLanguage: (language: string) => void
}
```

### **Events**
```javascript
// Listen for SDK events
window.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'CONSENT_ACTION':
      // User made a consent choice
      break;
    case 'LANGUAGE_CHANGE':
      // User changed language
      break;
    case 'CLOSE_BANNER':
      // Banner was closed
      break;
  }
});
```

---

**Need help?** Check the `/test-sdk.html` page for interactive testing and debugging tools.