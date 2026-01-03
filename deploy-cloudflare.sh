#!/bin/bash

# DPDP Consent Management System - Cloudflare Deployment Script

echo "🚀 Starting Cloudflare deployment for DPDP Consent Management System..."

# Use local wrangler
WRANGLER="npx wrangler"

# Check if wrangler is available
if ! $WRANGLER --version &> /dev/null; then
    echo "📦 Installing Wrangler CLI locally..."
    npm install wrangler --save-dev
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
$WRANGLER whoami || $WRANGLER login

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."

# Create or update the Pages project
$WRANGLER pages project create dpdp-consent-manager --compatibility-date=2024-01-01 || echo "Project already exists"

# Deploy the built application
$WRANGLER pages deploy out --project-name=dpdp-consent-manager --compatibility-date=2024-01-01

echo "✅ Deployment completed!"
echo ""
echo "🔗 Your DPDP Consent Management System is now live on Cloudflare!"
echo "📋 Next steps:"
echo "   1. Configure your custom domain in Cloudflare Pages dashboard"
echo "   2. Set up environment variables (DATABASE_URL) in Pages settings"
echo "   3. Test all API endpoints and functionality"
echo "   4. Update CORS settings if needed for your domain"
echo ""
echo "🌍 Access your deployment at: https://dpdp-consent-manager.pages.dev"