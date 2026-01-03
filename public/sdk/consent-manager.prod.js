/**
 * DPDP Consent Manager SDK v1.0.0 - Production Version
 * Script-based embed for consent management
 * 
 * Production Configuration:
 * - HTTPS enforcement
 * - Production domain handling
 * - Enhanced security
 */
(function() {
  'use strict';

  // Configuration
  const SDK_VERSION = '1.0.0';
  
  // Production base URL (replace with your actual domain)
  const PRODUCTION_DOMAIN = 'consent-manager.yourdomain.com';
  const BASE_URL = `https://${PRODUCTION_DOMAIN}`;
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

    // Security check: Ensure HTTPS in production
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.error('[DPDP SDK] HTTPS required for production deployment');
      return;
    }

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
      console.error('[DPDP SDK] BLOCKED: userId contains PII. Use opaque reference IDs only.');
      console.error('[DPDP SDK] Provided userId:', config.userId);
      return; // Block initialization if PII detected
    }

    console.log('[DPDP SDK] Initializing with template:', config.templateId);
    
    // Create and inject iframe
    createIframe();
    
    // Setup message listener
    setupMessageListener();
    
    isInitialized = true;
  }

  /**
   * Find the SDK script tag (production-safe)
   */
  function getSDKScript() {
    // Try multiple approaches to find the script
    const scripts = document.querySelectorAll(`script[src*="${PRODUCTION_DOMAIN}"]`);
    if (scripts.length > 0) {
      return scripts[scripts.length - 1];
    }
    
    // Fallback: look for script with data attributes
    const dataScripts = document.querySelectorAll('script[data-template-id]');
    if (dataScripts.length > 0) {
      return dataScripts[dataScripts.length - 1];
    }
    
    return null;
  }

  /**
   * Check if a string might contain PII (enhanced for production)
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
      /\b[A-Z]{2}\d{2}\s?\d{4}\s?\d{6}\b/, // IBAN-like
      /\b[A-Z]{2}\d{8}\b/,           // Passport-like
      /\b\d{12}\b/                   // Aadhaar-like
    ];
    
    return piiPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Fetch template configuration from backend
   */
  function fetchTemplateConfig() {
    const templateUrl = `${BASE_URL}/api/public/templates/${config.templateId}?language=${config.language}&platform=${config.platform}`;
    
    return fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=300' // 5 minute cache
      }
    })
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
        // Return minimal fallback template
        return {
          id: config.templateId,
          name: 'Privacy Consent',
          config: {
            title: 'Privacy & Cookie Consent',
            description: 'We use cookies to enhance your experience.',
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
              description: 'Required for basic functionality',
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

    fetchTemplateConfig().then(templateData => {
      // Store template data
      window.DPDPConsentManager.templateData = templateData;
      
      // Build iframe URL
      const params = new URLSearchParams({
        userId: config.userId,
        platform: config.platform,
        language: config.language,
        templateData: JSON.stringify(templateData)
      });

      const iframeUrl = `${IFRAME_BASE_URL}/${config.templateId}?${params.toString()}`;

      // Create iframe with enhanced security
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
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');

      document.body.appendChild(iframe);
      console.log('[DPDP SDK] Consent banner loaded');
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
    // Strict origin validation for production
    if (event.origin !== BASE_URL) {
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
    console.log('[DPDP SDK] Consent action:', payload.status);

    const apiPayload = {
      templateId: config.templateId,
      userReferenceId: config.userId,
      status: payload.status,
      purposes: payload.purposes || [],
      timestamp: payload.timestamp || Date.now(),
      platform: config.platform,
      language: payload.language || config.language
    };

    sendConsentToAPI(apiPayload);
  }

  /**
   * Handle language change from iframe
   */
  function handleLanguageChange(payload) {
    config.language = payload.language;
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
   * Send consent data to backend API (production version)
   */
  function sendConsentToAPI(payload) {
    const url = `${API_BASE_URL}/update-user`;
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
      console.log('[DPDP SDK] Consent saved');
      
      // Hide banner after successful save
      if (payload.status === 'accepted' || payload.status === 'rejected') {
        handleCloseBanner();
      }
      
      // Dispatch custom event for client applications
      window.dispatchEvent(new CustomEvent('dpdp-consent-saved', {
        detail: {
          templateId: payload.templateId,
          status: payload.status,
          purposes: payload.purposes,
          timestamp: payload.timestamp
        }
      }));
    })
    .catch(error => {
      console.error('[DPDP SDK] Failed to save consent:', error);
      
      // Single retry with exponential backoff
      setTimeout(() => {
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
          console.log('[DPDP SDK] Consent saved on retry');
          if (payload.status === 'accepted' || payload.status === 'rejected') {
            handleCloseBanner();
          }
        })
        .catch(retryError => {
          console.error('[DPDP SDK] Retry failed - consent not saved');
          
          // Dispatch error event
          window.dispatchEvent(new CustomEvent('dpdp-consent-error', {
            detail: { error: retryError.message, payload }
          }));
        });
      }, 2000); // 2 second delay
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
      config.language = language;
      if (iframe) {
        iframe.contentWindow.postMessage({
          type: 'UPDATE_LANGUAGE',
          payload: { language }
        }, BASE_URL);
      }
    },
    getConsentStatus: function() {
      return {
        templateId: config.templateId,
        userId: config.userId,
        platform: config.platform,
        language: config.language,
        initialized: isInitialized
      };
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();