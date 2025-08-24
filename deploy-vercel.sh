#!/bin/bash

# 🚀 Vercel Deployment Script for SenjaGames.id
# Run this script to deploy to production

echo "🚀 Starting deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Build the project first
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"

# Environment variables reminder
echo ""
echo "🔧 IMPORTANT: Make sure these environment variables are set in Vercel:"
echo "   - ZELENKA_TOKEN"
echo "   - VITE_FIREBASE_API_KEY"
echo "   - VITE_FIREBASE_AUTH_DOMAIN"
echo "   - VITE_FIREBASE_PROJECT_ID"
echo "   - VITE_FIREBASE_STORAGE_BUCKET"
echo "   - VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "   - VITE_FIREBASE_APP_ID"
echo "   - WINPAY_PARTNER_ID"
echo "   - WINPAY_CLIENT_SECRET"
echo "   - VITE_USD_TO_IDR_RATE"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
echo "📝 Set env vars at: https://vercel.com/[username]/[project]/settings/environment-variables"
