/**
 * DPDP Consent Manager SDK v1.0.0
 * Script-based embed for consent management
 */
(function() {
  'use strict';

  // Configuration
  const SDK_VERSION = '1.0.0';
  // Dynamic base URL detection with protocol handling
  const BASE_URL = (function() {
    // For production, use the script's origin
    const scripts = document.querySelectorAll('script[src*="consent-manager"]');
    if (scripts.length > 0) {
      const scriptSrc = scripts[scripts.length - 1].src;
      const url = new URL(scriptSrc);
      return `${url.protocol}//${url.host}`;
    }
    // Fallback to current origin
    return window.location.origin;
  })();
  const IFRAME_BASE_URL = BASE_URL + '/iframe';
  const API_BASE_URL = BASE_URL + '/api/blutic-svc/api/v1/public/consent-template';

  // SDK State
  let config = {};
  let iframe = null;
  let isInitialized = false;

  /**
   * Initialize SDK from script tag attributes
   */
  function init() {
    if (isInitialized) return;

    const script = document.currentScript || getSDKScript();
    if (!script) {
      console.error('[DPDP SDK] Could not find SDK script tag');
      return;
    }

    // Read configuration from data attributes
    config = {
      templateId: script.dataset.templateId,
      userId: script.dataset.userId,
      platform: script.dataset.platform || 'web',
      language: script.dataset.language || 'en'
    };

    // Validate required configuration
    if (!config.templateId || !config.userId) {
      console.error('[DPDP SDK] Missing required configuration: templateId and userId are required');
      return;
    }

    // PII Protection: Warn if userId looks like email or phone
    if (isPotentialPII(config.userId)) {
      console.warn('[DPDP SDK] WARNING: userId appears to contain PII. Use opaque reference IDs only.');
      console.warn('[DPDP SDK] Current userId:', config.userId);
    }

    console.log('[DPDP SDK] Initializing with config:', config);
    
    // Create and inject iframe
    createIframe();
    
    // Setup message listener
    setupMessageListener();
    
    isInitialized = true;
  }

  /**
   * Find the SDK script tag (safer fallback for bundled environments)
   */
  function getSDKScript() {
    // Try multiple approaches to find the script
    const scripts = document.querySelectorAll('script[src*="consent-manager"]');
    if (scripts.length > 0) {
      return scripts[scripts.length - 1]; // Get the last one (most recent)
    }
    
    // Fallback: look for script with data attributes
    const dataScripts = document.querySelectorAll('script[data-template-id]');
    if (dataScripts.length > 0) {
      return dataScripts[dataScripts.length - 1];
    }
    
    return null;
  }

  /**
   * Fetch template configuration from backend
   */
  function fetchTemplateConfig() {
    const templateUrl = `${BASE_URL}/api/public/templates/${config.templateId}?language=${config.language}&platform=${config.platform}`;
    
    return fetch(templateUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Template fetch failed: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data.success) {
          throw new Error('Template fetch failed: ' + data.message);
        }
        return data.data;
      })
      .catch(error => {
        console.error('[DPDP SDK] Failed to fetch template:', error);
        // Return fallback template
        return {
          id: config.templateId,
          name: 'Default Consent',
          config: {
            title: 'Privacy & Cookie Consent',
            description: 'We use cookies to enhance your experience and analyze our traffic.',
            acceptButtonText: 'Accept All',
            rejectButtonText: 'Reject All',
            customizeButtonText: 'Customize',
            position: 'bottom',
            theme: 'light',
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#374151'
          },
          purposes: [
            {
              id: 'essential',
              name: 'Essential Cookies',
              description: 'Required for basic website functionality',
              required: true,
              category: 'essential'
            }
          ],
          language: config.language,
          platform: config.platform
        };
      });
  }

  /**
   * Create and inject the consent iframe
   */
  function createIframe() {
    if (iframe) return;

    // First fetch template configuration
    fetchTemplateConfig().then(templateData => {
      // Store template data for later use
      window.DPDPConsentManager.templateData = templateData;
      
      // Build iframe URL with parameters
      const params = new URLSearchParams({
        userId: config.userId,
        platform: config.platform,
        language: config.language,
        templateData: JSON.stringify(templateData)
      });

      const iframeUrl = `${IFRAME_BASE_URL}/${config.templateId}?${params.toString()}`;

      // Create iframe element
      iframe = document.createElement('iframe');
      iframe.src = iframeUrl;
      iframe.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        z-index: 999999;
        background: transparent;
        pointer-events: auto;
      `;
      iframe.setAttribute('title', 'DPDP Consent Manager');
      iframe.setAttribute('aria-label', 'Cookie and Privacy Consent');

      // Append to body
      document.body.appendChild(iframe);

      console.log('[DPDP SDK] Iframe created and injected with template:', templateData.name);
    });
  }

  /**
   * Setup message listener for iframe communication
   */
  function setupMessageListener() {
    window.addEventListener('message', handleMessage, false);
  }

  /**
   * Handle messages from iframe
   */
  function handleMessage(event) {
    // Validate origin for security - allow both current origin and BASE_URL
    const allowedOrigins = [window.location.origin, BASE_URL];
    if (!allowedOrigins.includes(event.origin)) {
      console.warn('[DPDP SDK] Message from unauthorized origin:', event.origin);
      return;
    }

    const { type, payload } = event.data;

    switch (type) {
      case 'CONSENT_ACTION':
        handleConsentAction(payload);
        break;
      case 'LANGUAGE_CHANGE':
        handleLanguageChange(payload);
        break;
      case 'CLOSE_BANNER':
        handleCloseBanner();
        break;
      default:
        console.log('[DPDP SDK] Unknown message type:', type);
    }
  }

  /**
   * Handle consent action from iframe
   */
  function handleConsentAction(payload) {
    console.log('[DPDP SDK] Consent action received:', payload);

    // Prepare API payload
    const apiPayload = {
      templateId: config.templateId,
      userReferenceId: config.userId,
      status: payload.status,
      purposes: payload.purposes || [],
      timestamp: payload.timestamp || Date.now(),
      platform: config.platform,
      language: payload.language || config.language
    };

    // Send to backend API
    sendConsentToAPI(apiPayload);
  }

  /**
   * Handle language change from iframe
   */
  function handleLanguageChange(payload) {
    console.log('[DPDP SDK] Language change:', payload.language);
    config.language = payload.language;
    
    // Refresh iframe with new language
    refreshIframeWithLanguage(payload.language);
  }

  /**
   * Refresh iframe with new language settings
   */
  function refreshIframeWithLanguage(newLanguage) {
    if (!iframe) return;
    
    // Update config
    config.language = newLanguage;
    
    // Fetch updated template with new language
    fetchTemplateConfig().then(templateData => {
      // Update stored template data
      window.DPDPConsentManager.templateData = templateData;
      
      // Build new iframe URL with updated language
      const params = new URLSearchParams({
        userId: config.userId,
        platform: config.platform,
        language: newLanguage,
        templateData: JSON.stringify(templateData)
      });

      const newIframeUrl = `${IFRAME_BASE_URL}/${config.templateId}?${params.toString()}`;
      
      // Update iframe src to reload with new language
      iframe.src = newIframeUrl;
      
      console.log('[DPDP SDK] Iframe refreshed with language:', newLanguage);
    });
  }

  /**
   * Handle banner close
   */
  function handleCloseBanner() {
    if (iframe) {
      iframe.style.display = 'none';
    }
  }

  /**
   * Check if a string might contain PII (basic heuristics)
   */
  function isPotentialPII(str) {
    if (!str || typeof str !== 'string') return false;
    
    // Check for email pattern
    if (str.includes('@') && str.includes('.')) return true;
    
    // Check for phone number patterns (10+ digits)
    const digitCount = (str.match(/\d/g) || []).length;
    if (digitCount >= 10) return true;
    
    // Check for common PII patterns
    const piiPatterns = [
      /\b\d{4}-\d{4}-\d{4}-\d{4}\b/, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/,       // SSN
      /\b[A-Z]{2}\d{2}\s?\d{4}\s?\d{6}\b/ // IBAN-like
    ];
    
    return piiPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Send consent data to backend API
   */
  function sendConsentToAPI(payload) {
    const url = `${API_BASE_URL}/update-user`;
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('[DPDP SDK] Consent saved successfully:', data);
      // Optionally hide banner after successful save
      if (payload.status === 'accepted' || payload.status === 'rejected') {
        handleCloseBanner();
      }
    })
    .catch(error => {
      console.error('[DPDP SDK] Failed to save consent:', error);
      // Retry once after 1 second
      setTimeout(() => {
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
          console.log('[DPDP SDK] Consent saved on retry:', data);
          if (payload.status === 'accepted' || payload.status === 'rejected') {
            handleCloseBanner();
          }
        })
        .catch(retryError => {
          console.error('[DPDP SDK] Retry failed:', retryError);
        });
      }, 1000);
    });
  }

  /**
   * Public API
   */
  window.DPDPConsentManager = {
    version: SDK_VERSION,
    config: config,
    showBanner: function() {
      if (iframe) {
        iframe.style.display = 'block';
      }
    },
    hideBanner: function() {
      handleCloseBanner();
    },
    updateLanguage: function(language) {
      console.log('[DPDP SDK] Updating language to:', language);
      refreshIframeWithLanguage(language);
    },
    getCurrentLanguage: function() {
      return config.language;
    },
    getSupportedLanguages: function() {
      return [
        { code: "en", name: "English" },
        { code: "mr", name: "Marathi - मराठी" },
        { code: "ta", name: "Tamil - தமிழ்" },
        { code: "gu", name: "Gujarati - ગુજરાતી" },
        { code: "kn", name: "Kannada - ಕನ್ನಡ" },
        { code: "ml", name: "Malayalam - മലയാളം" },
        { code: "or", name: "Odia - ଓଡ଼ିଆ" },
        { code: "pa", name: "Punjabi - ਪੰਜਾਬੀ" },
        { code: "as", name: "Assamese - অসমীয়া" },
        { code: "mai", name: "Maithili - मैथिली" },
        { code: "bh", name: "Bhojpuri - भोजपुरी" },
        { code: "ks", name: "Kashmiri - कश्मीरी" },
        { code: "ne", name: "Nepali - नेपाली" },
        { code: "sd", name: "Sindhi - سنڌي" },
        { code: "ur", name: "Urdu - اردو" },
        { code: "kok", name: "Konkani - कोंकणी" },
        { code: "mni", name: "Manipuri - মৈতৈলোন্" },
        { code: "sat", name: "Santali - ᱥᱟᱱᱛᱟᱲᱤ" },
        { code: "doi", name: "Dogri - डोगरी" }
      ];
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();