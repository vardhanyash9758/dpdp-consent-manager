#!/bin/bash

echo "🚀 Deploying DPDP Consent Management System to Cloudflare..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from your project root."
    exit 1
fi

# Check if we have a remote origin
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No GitHub remote found."
    echo "Please create a GitHub repository and add it as remote:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Create repository: dpdp-consent-manager"
    echo "3. Run: git remote add origin https://github.com/YOUR_USERNAME/dpdp-consent-manager.git"
    echo "4. Run this script again"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "🚀 Deploy: Updated DPDP Consent Management System" || echo "No changes to commit"
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub. Please check your remote configuration."
    exit 1
fi

echo "✅ Pushed to GitHub!"

# Deploy to Cloudflare
echo "🌐 Deploying to Cloudflare Pages..."

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
npx wrangler whoami || npx wrangler login

# Create project if it doesn't exist
echo "📋 Creating/updating Cloudflare Pages project..."
npx wrangler pages project create dpdp-consent-manager --compatibility-date=2024-01-01 || echo "Project already exists"

# Deploy
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy .next --project-name=dpdp-consent-manager --compatibility-date=2024-01-01

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "🌍 Your DPDP Consent Management System is now live at:"
    echo "   https://dpdp-consent-manager.pages.dev"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Configure environment variables in Cloudflare Pages dashboard"
    echo "   2. Set up custom domain (optional)"
    echo "   3. Test all functionality"
    echo "   4. Start collecting consent data!"
    echo ""
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi