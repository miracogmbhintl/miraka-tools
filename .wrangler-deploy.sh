#!/bin/bash
set -e

echo "🔍 Checking environment variables..."

# Load .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo "✅ Loaded .env file"
else
  echo "❌ .env file not found"
  exit 1
fi

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN not found in .env"
  exit 1
fi

echo "✅ Cloudflare API Token found"

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY not found in .env"
  exit 1
fi

echo "✅ OpenAI API Key found"

# Build the app
echo ""
echo "🔨 Building app..."
npm run build

# Set the secret using the API token
echo ""
echo "🔐 Setting OpenAI API Key secret..."
echo "$OPENAI_API_KEY" | npx wrangler secret put OPENAI_API_KEY --env production

# Deploy using the API token
echo ""
echo "🚀 Deploying to Cloudflare..."
npx wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app should be live at your Cloudflare Workers URL"
