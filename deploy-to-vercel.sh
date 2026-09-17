#!/bin/bash
# Deploy RPSFull frontend to Vercel
# This script handles the monorepo deployment

set -e

echo "🚀 Deploying RPSFull to Vercel..."

# Navigate to project root
cd "$(dirname "$0")"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Install it with: npm i -g vercel"
    exit 1
fi

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    echo "📦 Linking project to Vercel..."
    vercel link --yes
fi

echo "📋 Current project settings:"
vercel project inspect frontend 2>&1 | grep -E "(Root Directory|Build Command|Output Directory)" || true

echo ""
echo "⚠️  IMPORTANT: Root Directory must be set to 'packages/frontend' in Vercel Dashboard"
echo "   Go to: https://vercel.com/rvegajrs-projects/frontend/settings/general"
echo "   Update Root Directory from '.' to 'packages/frontend'"
echo ""
read -p "Have you updated the Root Directory in Vercel Dashboard? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please update the Root Directory first, then run this script again."
    exit 1
fi

echo "🚀 Deploying to production..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo "🌐 Check your deployment at: https://vercel.com/rvegajrs-projects/frontend"

