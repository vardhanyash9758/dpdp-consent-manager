# Translation System Guide

## Overview

The DPDP Consent Management System now includes a comprehensive, real-time translation system that supports dynamic language switching for all content including purposes, descriptions, data fields, and button text.

## Features

### ✅ Complete Translation Coverage
- **Header and Body Text**: Main consent banner title and description
- **Purpose Components**: All purpose names and descriptions
- **Data Fields**: Field names (Name, Email, Phone, Address, DOB)
- **Button Text**: All custom buttons (Accept All, Reject All, Customize, etc.)
- **UI Labels**: All interface labels and helper text

### ✅ Real-Time Language Switching
- Instant translation updates without page reload
- Client-side translation caching for performance
- Smooth user experience with loading states

### ✅ Supported Languages
The system supports 19 Indian languages plus English:
- English (en)
- Marathi - मराठी (mr)
- Tamil - தமிழ் (ta)
- Gujarati - ગુજરાતી (gu)
- Kannada - ಕನ್ನಡ (kn)
- Malayalam - മലയാളം (ml)
- Odia - ଓଡ଼ିଆ (or)
- Punjabi - ਪੰਜਾਬੀ (pa)
- Assamese - অসমীয়া (as)
- Maithili - मैथिली (mai)
- Bhojpuri - भोजपुरी (bh)
- Kashmiri - कश्मीरी (ks)
- Nepali - नेपाली (ne)
- Sindhi - سنڌي (sd)
- Urdu - اردو (ur)
- Konkani - कोंकणी (kok)
- Manipuri - মৈতৈলোন্ (mni)
- Santali - ᱥᱟᱱᱛᱟᱲᱤ (sat)
- Dogri - डोगरी (doi)

## Architecture

### 1. Translation API (`/api/translate`)

**Endpoint**: `POST /api/translate`

**Request**:
```json
{
  "text": "Request for Data Usage Consent",
  "targetLanguage": "bh",
  "languageName": "Bhojpuri - भोजपुरी"
}
```

**Response**:
```json
{
  "success": true,
  "translatedText": "डेटा उपयोग सहमति के लिए अनुरोध",
  "originalText": "Request for Data Usage Consent",
  "targetLanguage": "bh",
  "languageName": "Bhojpuri - भोजपुरी"
}
```

**Features**:
- Mock translations for common phrases
- Placeholder translations for unmapped text
- Ready for integration with real translation services (Google Translate, AWS Translate, etc.)

### 2. Translation Hook (`useTranslations`)

**Location**: `hooks/use-translations.ts`

**Usage**:
```typescript
import { useTranslations } from '@/hooks/use-translations'

function MyComponent() {
  const { translate, translateMultiple, isTranslating } = useTranslations()
  
  // Translate single text
  const translatedText = await translate('Hello', 'bh', 'Bhojpuri')
  
  // Translate multiple texts at once
  const translations = await translateMultiple(
    ['Hello', 'Goodbye', 'Thank you'],
    'bh',
    'Bhojpuri'
  )
}
```

**Features**:
- Automatic caching to avoid redundant API calls
- Batch translation support for efficiency
- Loading state management
- Error handling with fallback to original text

### 3. Notice Banner Integration

**Location**: `components/notice-banner-config.tsx`

The notice banner now automatically translates:
- Header text
- Body text
- All purpose names and descriptions
- All data field labels
- All button text
- UI helper text

**How it works**:
1. User selects a language from the dropdown
2. System collects all translatable text (header, body, purposes, buttons)
3. Batch translation request sent to API
4. Translations cached and applied to preview
5. Translations saved with template for future use

### 4. SDK Integration

**Location**: `public/sdk/consent-manager.js`

**Public API Methods**:

```javascript
// Update language programmatically
window.DPDPConsentManager.updateLanguage('bh')

// Get current language
const currentLang = window.DPDPConsentManager.getCurrentLanguage()

// Get supported languages
const languages = window.DPDPConsentManager.getSupportedLanguages()
```

**Features**:
- Real-time iframe refresh with new language
- Automatic template data refetch
- Seamless user experience

## Usage Examples

### Example 1: Basic Translation in Notice Banner

```typescript
// User clicks "Change Language" button
// Selects "Bhojpuri - भोजपुरी"
// System automatically:
// 1. Translates all content
// 2. Updates preview in real-time
// 3. Caches translations
// 4. Saves with template
```

### Example 2: Programmatic Language Change

```html
<script>
  // Change language from your application
  function changeLanguage(languageCode) {
    window.DPDPConsentManager.updateLanguage(languageCode)
  }
  
  // Example: Change to Bhojpuri
  changeLanguage('bh')
</script>
```

### Example 3: Custom Purpose Translation

```typescript
// When creating a custom purpose
const purpose = {
  name: "Marketing Communications",
  description: "We use your data for marketing purposes",
  // ... other fields
}

// System automatically translates when language changes
// Translation cached for future use
```

## Database Schema

Translations are stored in the `consent_templates` table:

```sql
CREATE TABLE consent_templates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  banner_config JSONB NOT NULL,
  translations JSONB DEFAULT '{}',  -- Stores all translations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Translation Structure**:
```json
{
  "bh": {
    "title": "डेटा उपयोग सहमति के लिए अनुरोध",
    "description": "हमरा लगे राउर डेटा गोपनीयता महत्वपूर्ण बा",
    "acceptButtonText": "सब स्वीकार करीं",
    "rejectButtonText": "सब अस्वीकार करीं",
    "customizeButtonText": "अनुकूलित करीं",
    "purposes": {
      "marketing": {
        "name": "विपणन",
        "description": "विपणन उद्देश्य खातिर"
      }
    }
  }
}
```

## Integration with Real Translation Services

### Google Cloud Translation API

```typescript
// app/api/translate/route.ts
import { Translate } from '@google-cloud/translate/v2'

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  key: process.env.GOOGLE_TRANSLATE_API_KEY
})

export async function POST(request: NextRequest) {
  const { text, targetLanguage } = await request.json()
  
  const [translation] = await translate.translate(text, targetLanguage)
  
  return NextResponse.json({
    success: true,
    translatedText: translation,
    originalText: text,
    targetLanguage
  })
}
```

### AWS Translate

```typescript
// app/api/translate/route.ts
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate'

const client = new TranslateClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

export async function POST(request: NextRequest) {
  const { text, targetLanguage } = await request.json()
  
  const command = new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: 'en',
    TargetLanguageCode: targetLanguage
  })
  
  const response = await client.send(command)
  
  return NextResponse.json({
    success: true,
    translatedText: response.TranslatedText,
    originalText: text,
    targetLanguage
  })
}
```

## Performance Optimization

### 1. Translation Caching
- Client-side cache prevents redundant API calls
- Translations stored in component state
- Cache persists during session

### 2. Batch Translation
- Multiple texts translated in single operation
- Reduces API calls and improves performance
- Parallel processing for efficiency

### 3. Template-Level Caching
- Translations saved with template in database
- Loaded once and reused across sessions
- Reduces translation API costs

## Testing

### Test Translation Flow

1. **Open Notice Banner Configuration**
   ```
   Navigate to: Dashboard > Consent > Notice Banner
   ```

2. **Add Content**
   - Enter header text
   - Enter body text
   - Add purposes with descriptions
   - Add custom buttons

3. **Change Language**
   - Click "Change Language" button
   - Select "Bhojpuri - भोजपुरी"
   - Observe real-time translation in preview

4. **Verify Translation**
   - Check header text is translated
   - Check body text is translated
   - Check all purpose names are translated
   - Check all purpose descriptions are translated
   - Check all data field labels are translated
   - Check all button text is translated

5. **Save Template**
   - Click "Save as Template"
   - Verify translations are saved
   - Check database for translation data

### Test SDK Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Translation Test</title>
</head>
<body>
  <h1>Translation Test</h1>
  
  <button onclick="changeLanguage('bh')">Bhojpuri</button>
  <button onclick="changeLanguage('mr')">Marathi</button>
  <button onclick="changeLanguage('ta')">Tamil</button>
  <button onclick="changeLanguage('en')">English</button>
  
  <script 
    src="/sdk/consent-manager.js"
    data-template-id="YOUR_TEMPLATE_ID"
    data-user-id="test-user-123"
    data-platform="web"
    defer>
  </script>
  
  <script>
    function changeLanguage(lang) {
      window.DPDPConsentManager.updateLanguage(lang)
    }
  </script>
</body>
</html>
```

## Troubleshooting

### Issue: Translations not appearing

**Solution**:
1. Check browser console for errors
2. Verify API endpoint is accessible: `/api/translate`
3. Check network tab for failed requests
4. Verify language code is correct

### Issue: Some text not translating

**Solution**:
1. Check if text is in translation dictionary
2. Add missing translations to `app/api/translate/route.ts`
3. Or integrate with real translation service

### Issue: Slow translation performance

**Solution**:
1. Enable translation caching (already implemented)
2. Use batch translation for multiple texts
3. Consider pre-translating common phrases
4. Implement server-side caching with Redis

## Future Enhancements

1. **AI-Powered Translations**
   - Integrate with GPT-4 for context-aware translations
   - Support for regional dialects and variations

2. **Translation Management UI**
   - Admin interface to manage translations
   - Bulk import/export of translation files
   - Translation review and approval workflow

3. **Automatic Language Detection**
   - Detect user's browser language
   - Auto-select appropriate language on first load

4. **Translation Analytics**
   - Track which languages are most used
   - Identify missing translations
   - Monitor translation quality

## Support

For issues or questions about the translation system:
- Check this guide first
- Review the API documentation
- Test with the provided examples
- Check browser console for errors

## Summary

The translation system provides comprehensive, real-time language support for the entire consent management interface. It's designed to be:
- **Easy to use**: Simple API and hooks
- **Performant**: Caching and batch operations
- **Extensible**: Ready for real translation services
- **Complete**: Covers all UI text and content

All text in the consent banner, including dynamic purpose components, is now fully translatable and updates in real-time when the user changes language.