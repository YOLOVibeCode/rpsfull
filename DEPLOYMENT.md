# 🚀 Deployment Guide - rpsfull.pro

Complete deployment guide for the RPSFull platform to production.

## 🌐 Production Domains

- **Frontend**: https://rpsfull.pro
- **API**: https://api.rpsfull.pro
- **Email**: noreply@rpsfull.pro (via SendGrid)

## 📋 Pre-Deployment Checklist

- [ ] Domain `rpsfull.pro` configured
- [ ] DNS records set up
- [ ] PostgreSQL database provisioned
- [ ] SendGrid account configured
- [ ] Environment variables prepared
- [ ] Database migrations ready

## 🔧 Environment Variables

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://api.rpsfull.pro/api/v1
NEXT_PUBLIC_WS_URL=https://api.rpsfull.pro
NODE_ENV=production
```

### Backend

```env
# Domain
FRONTEND_URL=https://rpsfull.pro
CORS_ORIGIN=https://rpsfull.pro

# Database
DATABASE_URL=postgresql://user:password@host:5432/rpsfull_prod

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key-here
EMAIL_FROM=noreply@rpsfull.pro

# Server
PORT=4444
NODE_ENV=production
```

## 📧 SendGrid Setup

1. **API Key**: Already configured
2. **Sender Verification**: Verify `noreply@rpsfull.pro` in SendGrid
3. **Domain Authentication**: Authenticate `rpsfull.pro` domain (optional but recommended)

## 🗄️ Database Setup

1. Provision PostgreSQL database
2. Run migrations:
   ```bash
   export DATABASE_URL="your-production-database-url"
   cd packages/backend
   pnpm db:migrate
   ```
3. Seed initial data (optional):
   ```bash
   pnpm db:seed
   ```

## 🚀 Deployment Steps

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set root directory: `packages/frontend`
3. Configure build settings (see `VERCEL_DEPLOYMENT.md`)
4. Add environment variables
5. Deploy

### Backend

Deploy to your preferred platform (Railway, Render, DigitalOcean, etc.)

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

## ✅ Post-Deployment Verification

1. **Frontend**: https://rpsfull.pro loads correctly
2. **API Health**: https://api.rpsfull.pro/health returns 200
3. **Email**: Test tournament registration email
4. **WebSocket**: Test real-time features
5. **Database**: Verify data persistence

## 📚 Documentation

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detailed Vercel setup
- [.env.example](./.env.example) - Environment variable template

---

**Domain**: rpsfull.pro  
**Status**: Production Ready ✅

