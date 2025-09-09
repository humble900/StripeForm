#!/bin/bash

echo "🚀 Building StripeForm for production..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your production environment variables."
    echo "You can copy from env.template and fill in your values."
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out

# Install dependencies if needed
echo "📦 Checking dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output is in the .next directory"
    echo "🚀 Ready for deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi
