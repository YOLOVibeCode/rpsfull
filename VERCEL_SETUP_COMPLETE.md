# ✅ Vercel Setup Complete

## Current Status

✅ **Vercel CLI**: Installed and authenticated  
✅ **Project**: Linked to `rvegajrs-projects/frontend`  
✅ **Domain**: `rpsfull.pro` (DNS already configured)  
✅ **Configuration**: `vercel.json` updated

## 📋 Next Steps

### 1. Set Environment Variables

Run these commands from `packages/frontend/`:

```bash
cd packages/frontend

# Production API URL
echo "https://api.rpsfull.pro/api/v1" | vercel env add NEXT_PUBLIC_API_URL production

# Production WebSocket URL
echo "https://api.rpsfull.pro" | vercel env add NEXT_PUBLIC_WS_URL production

# Preview/Development (use same URLs for now)
echo "https://api.rpsfull.pro/api/v1" | vercel env add NEXT_PUBLIC_API_URL preview
echo "https://api.rpsfull.pro" | vercel env add NEXT_PUBLIC_WS_URL preview
echo "https://api.rpsfull.pro/api/v1" | vercel env add NEXT_PUBLIC_API_URL development
echo "https://api.rpsfull.pro" | vercel env add NEXT_PUBLIC_WS_URL development
```

Or use the script:
```bash
cd packages/frontend
./setup-vercel-env.sh
```

### 2. Add Domain (if not already added)

```bash
cd packages/frontend
vercel domains add rpsfull.pro
```

### 3. Deploy

```bash
cd packages/frontend

# Preview deployment (test first)
vercel

# Production deployment
vercel --prod
```

## 🔍 Verify Configuration

```bash
# Check environment variables
vercel env ls

# Check domains
vercel domains ls

# Check project info
vercel project ls
```

## 📝 Important Notes

1. **Root Directory**: Project is configured to use `packages/frontend` as root
2. **Build Command**: Automatically builds contracts package first
3. **Domain**: `rpsfull.pro` DNS is already configured
4. **Backend**: API should be deployed separately to `api.rpsfull.pro`

## 🚀 Deployment Checklist

- [ ] Environment variables set (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`)
- [ ] Domain added to Vercel project
- [ ] DNS records verified
- [ ] Test preview deployment
- [ ] Deploy to production
- [ ] Verify frontend loads at https://rpsfull.pro
- [ ] Test API connectivity

## 🐛 Troubleshooting

### Build Fails

- Ensure `pnpm contracts:build` runs successfully
- Check that all dependencies are in `package.json`
- Review build logs in Vercel dashboard

### Domain Not Working

- Verify DNS records point to Vercel
- Check domain status: `vercel domains ls`
- Wait for DNS propagation (can take up to 48 hours)

### Environment Variables Not Applied

- Ensure variables are set for correct environment (production/preview/development)
- Redeploy after adding variables: `vercel --prod`

---

**Project**: rvegajrs-projects/frontend  
**Domain**: rpsfull.pro  
**Status**: Ready for deployment ✅

