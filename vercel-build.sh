#!/bin/bash

# Vercel build script - optimized for deployment
echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Format code (but don't fail on formatting issues)
echo "🎨 Formatting code..."
npm run format || echo "⚠️  Formatting completed with warnings"

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Vercel build completed successfully!"
