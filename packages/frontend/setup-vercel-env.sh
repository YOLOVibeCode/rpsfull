#!/bin/bash
# Setup Vercel environment variables for rpsfull.pro

echo "🔧 Setting up Vercel environment variables..."

# API URLs
echo "https://api.rpsfull.pro/api/v1" | vercel env add NEXT_PUBLIC_API_URL production
echo "https://api.rpsfull.pro/api/v1" | vercel env add NEXT_PUBLIC_API_URL preview
echo "https://api.rpsfull.pro/api/v1" | vercel env add NEXT_PUBLIC_API_URL development

echo "https://api.rpsfull.pro" | vercel env add NEXT_PUBLIC_WS_URL production
echo "https://api.rpsfull.pro" | vercel env add NEXT_PUBLIC_WS_URL preview
echo "https://api.rpsfull.pro" | vercel env add NEXT_PUBLIC_WS_URL development

echo "✅ Environment variables configured!"
echo ""
echo "📝 Next steps:"
echo "1. Add domain: vercel domains add rpsfull.pro"
echo "2. Deploy: vercel --prod"

