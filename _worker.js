// Cloudflare Worker for handling API routes
// This file will be used by Cloudflare Pages Functions

import { NextRequest, NextResponse } from 'next/server'

// Import your API handlers
const apiHandlers = {
  // Templates API
  '/api/templates': {
    GET: async (request, env) => {
      // Import and call your templates GET handler
      const { GET } = await import('./app/api/templates/route.ts')
      return GET(request)
    },
    POST: async (request, env) => {
      const { POST } = await import('./app/api/templates/route.ts')
      return POST(request)
    }
  },
  
  // Purposes API
  '/api/purposes': {
    GET: async (request, env) => {
      const { GET } = await import('./app/api/purposes/route.ts')
      return GET(request)
    },
    POST: async (request, env) => {
      const { POST } = await import('./app/api/purposes/route.ts')
      return POST(request)
    }
  },
  
  // Settings API
  '/api/settings': {
    GET: async (request, env) => {
      const { GET } = await import('./app/api/settings/route.ts')
      return GET(request)
    },
    POST: async (request, env) => {
      const { POST } = await import('./app/api/settings/route.ts')
      return POST(request)
    }
  },
  
  // Translation API
  '/api/translate': {
    POST: async (request, env) => {
      const { POST } = await import('./app/api/translate/route.ts')
      return POST(request)
    }
  },
  
  // Consent Collection API
  '/api/blutic-svc/api/v1/public/consent-template/update-user': {
    GET: async (request, env) => {
      const { GET } = await import('./app/api/blutic-svc/api/v1/public/consent-template/update-user/route.ts')
      return GET(request)
    },
    POST: async (request, env) => {
      const { POST } = await import('./app/api/blutic-svc/api/v1/public/consent-template/update-user/route.ts')
      return POST(request)
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method
    
    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
    
    // Route API requests
    for (const [apiPath, handlers] of Object.entries(apiHandlers)) {
      if (path.startsWith(apiPath)) {
        const handler = handlers[method]
        if (handler) {
          try {
            // Set environment variables
            process.env.DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL
            
            const response = await handler(request, env)
            
            // Add CORS headers
            response.headers.set('Access-Control-Allow-Origin', '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            
            return response
          } catch (error) {
            console.error('API Error:', error)
            return new Response(JSON.stringify({
              success: false,
              error: 'Internal server error',
              message: error.message
            }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            })
          }
        }
      }
    }
    
    // For non-API routes, return 404
    return new Response('Not Found', { status: 404 })
  },
}