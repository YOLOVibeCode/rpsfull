# 🚀 Vercel Deployment - Quick Fix Instructions

## Current Issue
The Vercel project's Root Directory is set to `.` (root), but it needs to be `packages/frontend` to find Next.js.

## ✅ Quick Fix Steps

### Option 1: Update via Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard**: https://vercel.com/rvegajrs-projects/frontend/settings/general
2. **Scroll down** to find the **"Root Directory"** section
3. **Click "Edit"** next to Root Directory
4. **Change** from `.` to `packages/frontend`
5. **Click "Save"**
6. **Deploy** by running:
   ```bash
   cd /Users/admin/Dev/YOLOProjects/RPSFull
   vercel --prod
   ```

### Option 2: Use Vercel CLI (if supported)

Try updating via CLI:
```bash
# This may require Vercel API access
vercel project update frontend --root-directory packages/frontend
```

## 🎯 After Root Directory is Updated

Once the Root Directory is set to `packages/frontend`, the deployment should work:

```bash
cd /Users/admin/Dev/YOLOProjects/RPSFull
vercel --prod
```

## 📋 Current Configuration

- **Project**: `frontend` (rvegajrs-projects)
- **Root Directory**: Currently `.` (needs to be `packages/frontend`)
- **Build Command**: `pnpm install && pnpm contracts:build && pnpm --filter @rpsfull-platform/frontend build`
- **Output Directory**: `packages/frontend/.next`
- **Framework**: Next.js

## 🔍 Verify Settings

Check current project settings:
```bash
vercel project inspect frontend
```

## 🌐 Deployment URLs

After successful deployment:
- **Preview**: https://frontend-*.vercel.app
- **Production**: https://frontend-*.vercel.app (or custom domain if configured)

## 📝 Notes

- The `vercel.json` in the root is correctly configured
- Environment variables are already set
- The issue is solely the Root Directory setting in Vercel's project configuration

