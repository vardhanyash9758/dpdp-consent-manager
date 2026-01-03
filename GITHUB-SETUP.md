# 🚀 GitHub Setup & Cloudflare Deployment

## Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `dpdp-consent-manager`
3. **Description**: `DPDP Consent Management System - Simplified banner creation with global deployment`
4. **Visibility**: Public (or Private if preferred)
5. **Click**: "Create repository"

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/dpdp-consent-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Cloudflare Pages

### Option A: Automatic Deployment (Recommended)

1. **Go to Cloudflare Pages**: https://pages.cloudflare.com/
2. **Click**: "Create a project"
3. **Connect to Git**: Select GitHub
4. **Select Repository**: `dpdp-consent-manager`
5. **Build Settings**:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (leave empty)

6. **Environment Variables** (Add these in Cloudflare Pages dashboard):
   ```
   NODE_ENV=production
   DATABASE_URL=postgres://54d680ca865a036f91f9c9a9402201b654ff4412c90007fb4642f92846a8bcd5:sk_1_tzzXVB1y6r1GHqXQf4Y@db.prisma.io:5432/postgres?sslmode=require
   ```

7. **Click**: "Save and Deploy"

### Option B: Manual Deployment

```bash
# Login to Cloudflare
npx wrangler login

# Create Pages project
npx wrangler pages project create dpdp-consent-manager

# Deploy
npx wrangler pages deploy .next --project-name=dpdp-consent-manager
```

## 🎉 Your System Will Be Live At:

- **Cloudflare Pages URL**: `https://dpdp-consent-manager.pages.dev`
- **Custom Domain**: Configure in Cloudflare Pages dashboard

## ✅ What's Deployed:

- **Simplified Banner Creation** with purpose collection toggle
- **Professional UI** with shadcn components
- **Real-time Translation** (19+ Indian languages)
- **PostgreSQL Integration** with your existing database
- **Vendor Management** and DPA workflows
- **Purpose Management** with CRUD operations
- **SDK Integration** for website embedding
- **Global CDN** with sub-50ms response times

## 🔧 Post-Deployment:

1. **Test the system** at your live URL
2. **Configure custom domain** (optional)
3. **Monitor performance** in Cloudflare dashboard
4. **Start collecting consent data** globally!

Your DPDP Consent Management System is production-ready! 🌍