import { useState, useEffect, useCallback } from 'react'

interface TranslationCache {
  [key: string]: {
    [language: string]: string
  }
}

interface UseTranslationsReturn {
  translate: (text: string, targetLanguage: string, languageName?: string) => Promise<string>
  translateMultiple: (texts: string[], targetLanguage: string, languageName?: string) => Promise<Record<string, string>>
  getTranslation: (text: string, language: string) => string | null
  isTranslating: boolean
  clearCache: () => void
  cacheSize: number
}

export function useTranslations(): UseTranslationsReturn {
  const [translationCache, setTranslationCache] = useState<TranslationCache>({})
  const [isTranslating, setIsTranslating] = useState(false)

  // Get cached translation
  const getTranslation = useCallback((text: string, language: string): string | null => {
    return translationCache[text]?.[language] || null
  }, [translationCache])

  // Translate single text
  const translate = useCallback(async (
    text: string, 
    targetLanguage: string, 
    languageName?: string
  ): Promise<string> => {
    // Return original text for English
    if (targetLanguage === 'en') {
      return text
    }

    // Check cache first
    const cached = getTranslation(text, targetLanguage)
    if (cached) {
      return cached
    }

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          languageName
        })
      })

      if (response.ok) {
        const result = await response.json()
        const translatedText = result.translatedText

        // Cache the translation
        setTranslationCache(prev => ({
          ...prev,
          [text]: {
            ...prev[text],
            [targetLanguage]: translatedText
          }
        }))

        return translatedText
      } else {
        console.error('Translation failed:', await response.text())
        return text // Return original text on failure
      }
    } catch (error) {
      console.error('Translation error:', error)
      return text // Return original text on error
    } finally {
      setIsTranslating(false)
    }
  }, [getTranslation])

  // Translate multiple texts at once
  const translateMultiple = useCallback(async (
    texts: string[], 
    targetLanguage: string, 
    languageName?: string
  ): Promise<Record<string, string>> => {
    if (targetLanguage === 'en') {
      return texts.reduce((acc, text) => ({ ...acc, [text]: text }), {})
    }

    setIsTranslating(true)
    const results: Record<string, string> = {}
    
    try {
      // Check cache for each text
      const textsToTranslate: string[] = []
      
      for (const text of texts) {
        const cached = getTranslation(text, targetLanguage)
        if (cached) {
          results[text] = cached
        } else {
          textsToTranslate.push(text)
        }
      }

      // Translate uncached texts in parallel
      if (textsToTranslate.length > 0) {
        const translationPromises = textsToTranslate.map(async (text) => {
          const translatedText = await translate(text, targetLanguage, languageName)
          return { original: text, translated: translatedText }
        })

        const translations = await Promise.all(translationPromises)
        
        // Add to results
        translations.forEach(({ original, translated }) => {
          results[original] = translated
        })
      }

      return results
    } catch (error) {
      console.error('Multiple translation error:', error)
      // Return original texts on error
      return texts.reduce((acc, text) => ({ ...acc, [text]: text }), {})
    } finally {
      setIsTranslating(false)
    }
  }, [getTranslation, translate])

  // Clear translation cache
  const clearCache = useCallback(() => {
    setTranslationCache({})
  }, [])

  // Get cache size for debugging
  const cacheSize = Object.keys(translationCache).length

  return {
    translate,
    translateMultiple,
    getTranslation,
    isTranslating,
    clearCache,
    cacheSize
  }
}