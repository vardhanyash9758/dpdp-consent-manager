# 🚀 DPDP Consent Management System

A comprehensive, DPDP-compliant consent management system with simplified banner creation, real-time translation, and global deployment capabilities.

## 🌍 Live Demo
- **Production**: https://dpdp-consent-manager.pages.dev
- **GitHub**: https://github.com/vardhanyash9758/dpdp-consent-manager

## ✨ Key Features

### 🎯 Simplified Banner Creation
- **Toggle-based purpose collection** (no more complex forms)
- **2-tab interface** (Overview, Button) - streamlined from 3 tabs
- **Real-time preview** with live translation
- **Professional UI** with shadcn components

### 🌐 Multi-Language Support
- **19+ Indian languages** + English
- **Real-time translation** of all UI elements
- **Client-side caching** for performance
- **Batch translation** API

### 🗄️ Database Integration
- **PostgreSQL** with connection pooling
- **Migration system** for schema updates
- **Audit logging** for compliance
- **Data retention** controls

### 🏢 Vendor Management
- **Risk assessment** and scoring
- **DPA workflow** management
- **Bulk operations** for efficiency
- **Export capabilities** (CSV/JSON)

### ⚙️ Purpose Management
- **CRUD operations** for data purposes
- **Category-based organization**
- **Usage tracking** and analytics
- **Validity management** (months-based)

### 🔧 Settings & Configuration
- **App-wide settings** management
- **Toggle controls** for features
- **Environment-based** configuration
- **Security controls**

### 📊 Analytics & Monitoring
- **Consent collection** tracking
- **Template performance** metrics
- **User engagement** analytics
- **Compliance reporting**

### 🌐 SDK Integration
- **Website embedding** via script tag
- **Template-based** consent collection
- **Cross-platform** support (Web, Mobile)
- **Customizable** appearance

## 🛠️ Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, PostgreSQL
- **Deployment**: Cloudflare Pages, Global CDN
- **Translation**: Custom API with 19+ languages
- **Database**: PostgreSQL with connection pooling

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/vardhanyash9758/dpdp-consent-manager.git
cd dpdp-consent-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
# Add your DATABASE_URL
```

### 4. Database Setup
```bash
npm run migrate:up
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your DPDP system.

## 📋 API Endpoints

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template
- `GET /api/templates/[id]` - Get template by ID
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### Purposes
- `GET /api/purposes` - List all purposes
- `POST /api/purposes` - Create new purpose
- `GET /api/purposes/[id]` - Get purpose by ID
- `PUT /api/purposes/[id]` - Update purpose
- `DELETE /api/purposes/[id]` - Delete purpose

### Consent Collection
- `GET /api/blutic-svc/api/v1/public/consent-template/update-user` - Get consent data
- `POST /api/blutic-svc/api/v1/public/consent-template/update-user` - Submit consent

### Translation
- `POST /api/translate` - Translate text to target language

### Settings
- `GET /api/settings` - Get app settings
- `POST /api/settings` - Update app settings

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL=postgres://user:pass@host:port/db?sslmode=require
NODE_ENV=production
```

### Cloudflare Pages
- **Build command**: `npm run build`
- **Build output**: `.next`
- **Node.js version**: 18+

## 📖 Documentation

- [API Documentation](./API-DOCUMENTATION.md)
- [Database Schema](./DATABASE-SCHEMA-SPECIFICATION.json)
- [Deployment Guide](./CLOUDFLARE-DEPLOYMENT.md)
- [Translation Guide](./TRANSLATION-GUIDE.md)
- [Purpose Management](./PURPOSE-MANAGEMENT-GUIDE.md)
- [Vendor Management](./VENDOR-MANAGEMENT.md)
- [DPA Workflow](./DPA-WORKFLOW-GUIDE.md)
- [SDK Integration](./SDK-INTEGRATION-GUIDE.md)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (PostgreSQL)  │
│   - Dashboard   │    │   - Templates   │    │   - Templates   │
│   - Banner UI   │    │   - Purposes    │    │   - Purposes    │
│   - Translation │    │   - Consent     │    │   - Consents    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SDK/Embed    │    │   Translation   │    │   Audit Logs   │
│   - Websites    │    │   - 19+ Langs   │    │   - Compliance  │
│   - Mobile      │    │   - Real-time   │    │   - Tracking    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security & Compliance

### DPDP Compliance
- ✅ **User consent** tracking and management
- ✅ **Data retention** controls and policies
- ✅ **Audit logging** for compliance reporting
- ✅ **Purpose-based** data collection
- ✅ **User rights** management (access, deletion)

### Security Features
- ✅ **HTTPS/TLS** encryption (Cloudflare)
- ✅ **CORS** protection
- ✅ **SQL injection** prevention
- ✅ **Input validation** and sanitization
- ✅ **Environment** variable protection

## 📊 Performance

### Global Performance
- **Response Time**: <50ms globally (Cloudflare Edge)
- **Uptime**: 99.99% SLA
- **Scalability**: Auto-scaling with traffic
- **CDN**: 200+ edge locations worldwide

### Database Performance
- **Connection Pooling**: Optimized for concurrent requests
- **Query Optimization**: Indexed for fast responses
- **Data Integrity**: ACID compliance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Cloudflare** for global deployment infrastructure
- **PostgreSQL** for reliable data storage
- **Next.js** for the amazing full-stack framework

---

**Built with ❤️ for DPDP compliance and global consent management**