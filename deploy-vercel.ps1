# 🚀 Vercel Deployment Script for SenjaGames.id (PowerShell)
# Run this script to deploy to production

Write-Host "🚀 Starting deployment to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Build the project first
Write-Host "🔨 Building project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green

# Environment variables reminder
Write-Host ""
Write-Host "🔧 IMPORTANT: Make sure these environment variables are set in Vercel:" -ForegroundColor Yellow
Write-Host "   - ZELENKA_TOKEN" -ForegroundColor Cyan
Write-Host "   - VITE_FIREBASE_API_KEY" -ForegroundColor Cyan
Write-Host "   - VITE_FIREBASE_AUTH_DOMAIN" -ForegroundColor Cyan
Write-Host "   - VITE_FIREBASE_PROJECT_ID" -ForegroundColor Cyan
Write-Host "   - VITE_FIREBASE_STORAGE_BUCKET" -ForegroundColor Cyan
Write-Host "   - VITE_FIREBASE_MESSAGING_SENDER_ID" -ForegroundColor Cyan
Write-Host "   - VITE_FIREBASE_APP_ID" -ForegroundColor Cyan
Write-Host "   - WINPAY_PARTNER_ID" -ForegroundColor Cyan
Write-Host "   - WINPAY_CLIENT_SECRET" -ForegroundColor Cyan
Write-Host "   - VITE_USD_TO_IDR_RATE" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Magenta
Write-Host "📝 Set env vars at: https://vercel.com/[username]/[project]/settings/environment-variables" -ForegroundColor Magenta
