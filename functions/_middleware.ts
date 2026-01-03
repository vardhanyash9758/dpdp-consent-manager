// Cloudflare Pages Functions middleware
// This handles API routes for the deployed application

interface Env {
  DATABASE_URL: string
  NODE_ENV: string
}

interface Context {
  request: Request
  env: Env
  next: () => Promise<Response>
}

export const onRequest = async (context: Context) => {
  const { request, env, next } = context
  const url = new URL(request.url)
  
  // Handle CORS for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
  
  // Set environment variables for API routes
  if (url.pathname.startsWith('/api/')) {
    // Make environment variables available to the API routes
    globalThis.process = globalThis.process || {}
    globalThis.process.env = globalThis.process.env || {}
    
    // Use Object.assign to avoid readonly property issues
    Object.assign(globalThis.process.env, {
      DATABASE_URL: env.DATABASE_URL,
      NODE_ENV: env.NODE_ENV || 'production'
    })
  }
  
  // Continue to the next handler
  const response = await next()
  
  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}