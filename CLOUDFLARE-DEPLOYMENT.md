# Cloudflare Deployment Guide
## DPDP Consent Management System

This guide will help you deploy your DPDP Consent Management System to Cloudflare Pages with Workers for optimal performance and global distribution.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ installed
- Cloudflare account
- GitHub repository (optional, for automatic deployments)

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Deploy with One Command
```bash
npm run deploy:cloudflare
```

## 📋 Manual Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Create Cloudflare Pages Project
```bash
wrangler pages project create dpdp-consent-manager --compatibility-date=2024-01-01
```

### 3. Deploy to Cloudflare Pages
```bash
wrangler pages deploy out --project-name=dpdp-consent-manager --compatibility-date=2024-01-01
```

## ⚙️ Configuration

### Environment Variables
Set these in your Cloudflare Pages dashboard:

```env
NODE_ENV=production
DATABASE_URL=postgres://your-connection-string
```

### Custom Domain
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to "Custom domains" tab
4. Add your domain and configure DNS

## 🔧 Advanced Configuration

### API Routes
The system uses Cloudflare Pages Functions to handle API routes:
- `/api/templates` - Template management
- `/api/purposes` - Purpose management  
- `/api/settings` - Application settings
- `/api/translate` - Translation service
- `/api/blutic-svc/api/v1/public/consent-template/update-user` - Consent collection

### Database Configuration
The system is configured to work with your existing PostgreSQL database:
```
postgres://54d680ca865a036f91f9c9a9402201b654ff4412c90007fb4642f92846a8bcd5:sk_1_tzzXVB1y6r1GHqXQf4Y@db.prisma.io:5432/postgres?sslmode=require
```

### Performance Optimizations
- Static assets served from Cloudflare's global CDN
- API routes run on Cloudflare Workers (sub-50ms response times)
- Automatic HTTPS and HTTP/2
- Built-in DDoS protection

## 🌍 Global Distribution

Your DPDP system will be available globally with:
- **Edge locations**: 200+ cities worldwide
- **Latency**: Sub-50ms API responses
- **Uptime**: 99.99% SLA
- **Security**: Enterprise-grade protection

## 📊 Monitoring & Analytics

### Built-in Analytics
- Real-time visitor analytics
- Performance metrics
- Error tracking
- Geographic distribution

### Custom Monitoring
Add custom analytics to track:
- Consent collection rates
- Template performance
- User engagement
- Compliance metrics

## 🔒 Security Features

### Automatic Security
- DDoS protection
- WAF (Web Application Firewall)
- SSL/TLS encryption
- Bot management

### GDPR/DPDP Compliance
- Data processing in EU/India regions
- Audit logs
- Data retention controls
- User consent tracking

## 🚦 Deployment Workflow

### Automatic Deployments (GitHub)
1. Connect your GitHub repository
2. Push to main branch
3. Automatic build and deployment
4. Preview deployments for PRs

### Manual Deployments
```bash
# Preview deployment
npm run deploy:preview

# Production deployment  
npm run deploy:cloudflare
```

## 🛠️ Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next out
npm run build
```

**API Route Issues**
- Check environment variables in Pages dashboard
- Verify database connectivity
- Review function logs in Cloudflare dashboard

**CORS Issues**
- Update allowed origins in `functions/_middleware.ts`
- Check custom domain configuration

### Debug Commands
```bash
# Check authentication
wrangler whoami

# View deployment logs
wrangler pages deployment list --project-name=dpdp-consent-manager

# Test local functions
wrangler pages dev out
```

## 📈 Scaling Considerations

### Traffic Scaling
- Automatic scaling to handle traffic spikes
- No server management required
- Pay-per-request pricing model

### Database Scaling
- Consider Cloudflare D1 for SQLite compatibility
- Connection pooling for PostgreSQL
- Read replicas for high-traffic scenarios

## 🔄 Updates & Maintenance

### Updating the Application
1. Make changes to your code
2. Test locally with `npm run dev`
3. Deploy with `npm run deploy:cloudflare`
4. Monitor deployment in Cloudflare dashboard

### Database Migrations
```bash
# Run migrations before deployment
npm run migrate:up
```

## 📞 Support

### Resources
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

### Getting Help
- Cloudflare Community Forum
- GitHub Issues
- Cloudflare Support (for paid plans)

---

## 🎉 Success!

Your DPDP Consent Management System is now running on Cloudflare's global network with:
- ⚡ Lightning-fast performance
- 🌍 Global availability  
- 🔒 Enterprise security
- 📊 Built-in analytics
- 🚀 Automatic scaling

**Live URL**: `https://dpdp-consent-manager.pages.dev`

Configure your custom domain and start collecting compliant consent data worldwide!