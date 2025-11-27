# 🚀 Vercel Deployment Guide for rpsfull.pro

This guide covers deploying the RPSFull platform to Vercel with the domain `rpsfull.pro`.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: `npm i -g vercel`
3. **Domain**: `rpsfull.pro` configured in your DNS
4. **SendGrid Account**: For email delivery
5. **Database**: PostgreSQL database (Vercel Postgres, Supabase, or external)

## 🏗️ Architecture

```
rpsfull.pro (Frontend - Vercel)
    ↓
api.rpsfull.pro (Backend API - Vercel Serverless Functions or separate server)
    ↓
PostgreSQL Database (External)
```

## 📦 Step 1: Install SendGrid Package

```bash
cd packages/backend
pnpm add @sendgrid/mail
```

## 🔧 Step 2: Configure Vercel Project

### 2.1. Link Project to Vercel

```bash
cd /Users/admin/Dev/YOLOProjects/RPSFull
vercel link
```

### 2.2. Set Root Directory

In Vercel dashboard:
- **Root Directory**: `packages/frontend`
- **Framework Preset**: Next.js
- **Build Command**: `cd ../.. && pnpm contracts:build && pnpm --filter @rpsfull-platform/frontend build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

## 🌐 Step 3: Configure Domain

### 3.1. Add Domain in Vercel

1. Go to your project settings → Domains
2. Add `rpsfull.pro`
3. Add `www.rpsfull.pro` (optional, redirects to rpsfull.pro)
4. Follow DNS instructions

### 3.2. DNS Configuration

Add these DNS records:

```
Type    Name    Value
A       @       Vercel IP (provided by Vercel)
CNAME   www     cname.vercel-dns.com
```

## 🔐 Step 4: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Frontend Variables

```env
NEXT_PUBLIC_API_URL=https://api.rpsfull.pro/api/v1
NEXT_PUBLIC_WS_URL=https://api.rpsfull.pro
NODE_ENV=production
```

### Backend Variables (if using Vercel Serverless Functions)

```env
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
SENDGRID_API_KEY=your-sendgrid-api-key-here
EMAIL_FROM=noreply@rpsfull.pro
FRONTEND_URL=https://rpsfull.pro
CORS_ORIGIN=https://rpsfull.pro
NODE_ENV=production
```

## 📧 Step 5: SendGrid Configuration

### 5.1. Verify Sender Domain

1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Authenticate domain: `rpsfull.pro`
3. Add DNS records provided by SendGrid

### 5.2. Single Sender Verification (Quick Start)

If domain authentication takes time, use Single Sender Verification:

1. Go to SendGrid → Settings → Sender Authentication → Single Sender Verification
2. Add: `noreply@rpsfull.pro`
3. Verify via email
4. Use this email in `EMAIL_FROM`

## 🗄️ Step 6: Database Setup

### Option A: Vercel Postgres

1. Go to Vercel Dashboard → Storage → Create Database
2. Select PostgreSQL
3. Copy connection string to `DATABASE_URL`

### Option B: External Database (Supabase, Railway, etc.)

Use your external PostgreSQL connection string.

### 6.1. Run Migrations

After database is set up:

```bash
# Connect to production database
export DATABASE_URL="your-production-database-url"

# Run migrations
cd packages/backend
pnpm db:migrate

# Seed initial data (optional)
pnpm db:seed
```

## 🚀 Step 7: Deploy Backend API

### Option A: Vercel Serverless Functions (Recommended)

The backend can be deployed as Vercel Serverless Functions. However, WebSocket support requires a separate server.

### Option B: Separate Server (Recommended for WebSockets)

Deploy backend to:
- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)
- **DigitalOcean App Platform**: [digitalocean.com](https://digitalocean.com)
- **AWS EC2/ECS**: For full control

**Backend Environment Variables:**
```env
PORT=4444
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SENDGRID_API_KEY=your-sendgrid-api-key-here
EMAIL_FROM=noreply@rpsfull.pro
FRONTEND_URL=https://rpsfull.pro
CORS_ORIGIN=https://rpsfull.pro
NODE_ENV=production
```

**Backend URL**: `https://api.rpsfull.pro` (configure DNS CNAME: `api` → your server)

## 📝 Step 8: Update Frontend Configuration

The frontend is already configured to use environment variables. Ensure:

1. `NEXT_PUBLIC_API_URL` points to your backend API
2. `NEXT_PUBLIC_WS_URL` points to your WebSocket server

## 🔄 Step 9: Deploy

### Deploy Frontend to Vercel

```bash
cd /Users/admin/Dev/YOLOProjects/RPSFull
vercel --prod
```

Or push to GitHub and enable automatic deployments.

## ✅ Step 10: Verify Deployment

1. **Frontend**: https://rpsfull.pro
2. **API Health**: https://api.rpsfull.pro/health
3. **API Base**: https://api.rpsfull.pro/api/v1

## 🔍 Troubleshooting

### Frontend Can't Connect to Backend

- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify CORS settings on backend allow `https://rpsfull.pro`
- Check browser console for errors

### Emails Not Sending

- Verify `SENDGRID_API_KEY` is set correctly
- Check SendGrid dashboard for delivery logs
- Ensure sender email is verified in SendGrid

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### Build Failures

- Ensure `pnpm contracts:build` runs before frontend build
- Check all dependencies are in `package.json`
- Review build logs in Vercel dashboard

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Analytics

### SendGrid Dashboard

Monitor email delivery at [app.sendgrid.com](https://app.sendgrid.com)

### Database Monitoring

Use your database provider's monitoring tools

## 🔒 Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong random strings
- [ ] `SENDGRID_API_KEY` is kept secret
- [ ] CORS is configured to only allow `rpsfull.pro`
- [ ] Database connection uses SSL
- [ ] Rate limiting is enabled on API
- [ ] HTTPS is enforced (automatic with Vercel)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Domain**: rpsfull.pro  
**Frontend**: https://rpsfull.pro  
**API**: https://api.rpsfull.pro  
**Email**: SendGrid (noreply@rpsfull.pro)

