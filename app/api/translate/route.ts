import { NextRequest, NextResponse } from 'next/server'

// Mock translation service - replace with actual translation API
const mockTranslations: Record<string, Record<string, string>> = {
  'bh': { // Bhojpuri
    'Request for Data Usage Consent': 'डेटा उपयोग सहमति के लिए अनुरोध',
    'Your data privacy is important to us. You have the right to decline any optional data collection or usage not required for the basic functioning of our services.': 'हमरा लगे राउर डेटा गोपनीयता महत्वपूर्ण बा। राउर पास हमार सेवा के बुनियादी कामकाज खातिर जरूरी ना होखे वाला कवनो वैकल्पिक डेटा संग्रह या उपयोग के मना करे के अधिकार बा।',
    'Marketing': 'विपणन',
    'Analytics': 'विश्लेषण',
    'Essential': 'आवश्यक',
    'Personalization': 'व्यक्तिगतकरण',
    'Accept All': 'सब स्वीकार करीं',
    'Reject All': 'सब अस्वीकार करीं',
    'Customize': 'अनुकूलित करीं',
    'Name': 'नाम',
    'Email': 'ईमेल',
    'Phone': 'फोन',
    'Address': 'पता',
    'DOB': 'जन्म तिथि',
    'Essential Data Collection': 'आवश्यक डेटा संग्रह',
    'Data which are being collected:': 'जे डेटा संग्रह कइल जा रहल बा:',
    'Valid Till': 'वैध तक'
  },
  'mr': { // Marathi
    'Request for Data Usage Consent': 'डेटा वापराच्या संमतीसाठी विनंती',
    'Your data privacy is important to us. You have the right to decline any optional data collection or usage not required for the basic functioning of our services.': 'तुमची डेटा गोपनीयता आमच्यासाठी महत्वाची आहे। आमच्या सेवांच्या मूलभूत कार्यासाठी आवश्यक नसलेले कोणतेही वैकल्पिक डेटा संकलन किंवा वापर नाकारण्याचा तुम्हाला अधिकार आहे।',
    'Marketing': 'विपणन',
    'Analytics': 'विश्लेषण',
    'Essential': 'आवश्यक',
    'Personalization': 'वैयक्तिकीकरण',
    'Accept All': 'सर्व स्वीकारा',
    'Reject All': 'सर्व नाकारा',
    'Customize': 'सानुकूलित करा',
    'Name': 'नाव',
    'Email': 'ईमेल',
    'Phone': 'फोन',
    'Address': 'पत्ता',
    'DOB': 'जन्मतारीख',
    'Essential Data Collection': 'आवश्यक डेटा संकलन',
    'Data which are being collected:': 'जो डेटा गोळा केला जात आहे:',
    'Valid Till': 'पर्यंत वैध'
  },
  'ta': { // Tamil
    'Request for Data Usage Consent': 'தரவு பயன்பாட்டு ஒப்புதலுக்கான கோரிக்கை',
    'Your data privacy is important to us. You have the right to decline any optional data collection or usage not required for the basic functioning of our services.': 'உங்கள் தரவு தனியுரிமை எங்களுக்கு முக்கியமானது. எங்கள் சேவைகளின் அடிப்படை செயல்பாட்டிற்கு தேவையில்லாத எந்தவொரு விருப்பமான தரவு சேகரிப்பு அல்லது பயன்பாட்டையும் நிராகரிக்கும் உரிமை உங்களுக்கு உள்ளது।',
    'Marketing': 'சந்தைப்படுத்தல்',
    'Analytics': 'பகுப்பாய்வு',
    'Essential': 'அத்தியாவசியம்',
    'Personalization': 'தனிப்பயனாக்கம்',
    'Accept All': 'அனைத்தையும் ஏற்கவும்',
    'Reject All': 'அனைத்தையும் நிராகரிக்கவும்',
    'Customize': 'தனிப்பயனாக்கவும்',
    'Name': 'பெயர்',
    'Email': 'மின்னஞ்சல்',
    'Phone': 'தொலைபேசி',
    'Address': 'முகவரி',
    'DOB': 'பிறந்த தேதி',
    'Essential Data Collection': 'அத்தியாவசிய தரவு சேகரிப்பு',
    'Data which are being collected:': 'சேகரிக்கப்படும் தரவு:',
    'Valid Till': 'வரை செல்லுபடியாகும்'
  },
  'gu': { // Gujarati
    'Request for Data Usage Consent': 'ડેટા ઉપયોગ સંમતિ માટે વિનંતી',
    'Your data privacy is important to us. You have the right to decline any optional data collection or usage not required for the basic functioning of our services.': 'તમારી ડેટા ગોપનીયતા અમારા માટે મહત્વપૂર્ણ છે. અમારી સેવાઓના મૂળભૂત કાર્યો માટે જરૂરી ન હોય તેવા કોઈપણ વૈકલ્પિક ડેટા સંગ્રહ અથવા ઉપયોગને નકારવાનો તમને અધિકાર છે।',
    'Marketing': 'માર્કેટિંગ',
    'Analytics': 'વિશ્લેષણ',
    'Essential': 'આવશ્યક',
    'Personalization': 'વ્યક્તિગતકરણ',
    'Accept All': 'બધું સ્વીકારો',
    'Reject All': 'બધું નકારો',
    'Customize': 'કસ્ટમાઇઝ કરો',
    'Name': 'નામ',
    'Email': 'ઇમેઇલ',
    'Phone': 'ફોન',
    'Address': 'સરનામું',
    'DOB': 'જન્મ તારીખ',
    'Essential Data Collection': 'આવશ્યક ડેટા સંગ્રહ',
    'Data which are being collected:': 'જે ડેટા એકત્રિત કરવામાં આવે છે:',
    'Valid Till': 'સુધી માન્ય'
  },
  'kn': { // Kannada
    'Request for Data Usage Consent': 'ಡೇಟಾ ಬಳಕೆಯ ಒಪ್ಪಿಗೆಗಾಗಿ ವಿನಂತಿ',
    'Your data privacy is important to us. You have the right to decline any optional data collection or usage not required for the basic functioning of our services.': 'ನಿಮ್ಮ ಡೇಟಾ ಗೌಪ್ಯತೆ ನಮಗೆ ಮುಖ್ಯವಾಗಿದೆ. ನಮ್ಮ ಸೇವೆಗಳ ಮೂಲಭೂತ ಕಾರ್ಯಚಟುವಟಿಕೆಗೆ ಅಗತ್ಯವಿಲ್ಲದ ಯಾವುದೇ ಐಚ್ಛಿಕ ಡೇಟಾ ಸಂಗ್ರಹಣೆ ಅಥವಾ ಬಳಕೆಯನ್ನು ನಿರಾಕರಿಸುವ ಹಕ್ಕು ನಿಮಗಿದೆ।',
    'Marketing': 'ಮಾರ್ಕೆಟಿಂಗ್',
    'Analytics': 'ವಿಶ್ಲೇಷಣೆ',
    'Essential': 'ಅಗತ್ಯ',
    'Personalization': 'ವೈಯಕ್ತೀಕರಣ',
    'Accept All': 'ಎಲ್ಲವನ್ನೂ ಸ್ವೀಕರಿಸಿ',
    'Reject All': 'ಎಲ್ಲವನ್ನೂ ತಿರಸ್ಕರಿಸಿ',
    'Customize': 'ಕಸ್ಟಮೈಸ್ ಮಾಡಿ',
    'Name': 'ಹೆಸರು',
    'Email': 'ಇಮೇಲ್',
    'Phone': 'ಫೋನ್',
    'Address': 'ವಿಳಾಸ',
    'DOB': 'ಜನ್ಮ ದಿನಾಂಕ',
    'Essential Data Collection': 'ಅಗತ್ಯ ಡೇಟಾ ಸಂಗ್ರಹಣೆ',
    'Data which are being collected:': 'ಸಂಗ್ರಹಿಸಲಾಗುತ್ತಿರುವ ಡೇಟಾ:',
    'Valid Till': 'ವರೆಗೆ ಮಾನ್ಯ'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, languageName } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'text and targetLanguage are required'
      }, { status: 400 })
    }

    // Return original text for English
    if (targetLanguage === 'en') {
      return NextResponse.json({
        success: true,
        translatedText: text,
        originalText: text,
        targetLanguage,
        languageName: languageName || 'English'
      })
    }

    // Check if we have a mock translation
    const translations = mockTranslations[targetLanguage]
    if (translations && translations[text]) {
      return NextResponse.json({
        success: true,
        translatedText: translations[text],
        originalText: text,
        targetLanguage,
        languageName: languageName || targetLanguage
      })
    }

    // For texts not in our mock database, return a placeholder translation
    // In production, this would call a real translation service like Google Translate
    const placeholderTranslation = `[${languageName || targetLanguage}] ${text}`
    
    return NextResponse.json({
      success: true,
      translatedText: placeholderTranslation,
      originalText: text,
      targetLanguage,
      languageName: languageName || targetLanguage,
      note: 'This is a placeholder translation. Integrate with a real translation service for production use.'
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to translate text'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve available translations for a template
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const language = searchParams.get('language')

    if (!templateId) {
      return NextResponse.json({
        success: false,
        error: 'Missing templateId',
        message: 'templateId parameter is required'
      }, { status: 400 })
    }

    // In production, this would fetch from database
    // For now, return mock data
    const mockTemplateTranslations = {
      'bh': {
        title: 'डेटा उपयोग सहमति के लिए अनुरोध',
        description: 'हमरा लगे राउर डेटा गोपनीयता महत्वपूर्ण बा',
        acceptButtonText: 'सब स्वीकार करीं',
        rejectButtonText: 'सब अस्वीकार करीं',
        customizeButtonText: 'अनुकूलित करीं',
        purposes: {}
      }
    }

    if (language && mockTemplateTranslations[language as keyof typeof mockTemplateTranslations]) {
      return NextResponse.json({
        success: true,
        data: mockTemplateTranslations[language as keyof typeof mockTemplateTranslations]
      })
    }

    return NextResponse.json({
      success: true,
      data: mockTemplateTranslations
    })

  } catch (error) {
    console.error('Get translations error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch translations'
    }, { status: 500 })
  }
}