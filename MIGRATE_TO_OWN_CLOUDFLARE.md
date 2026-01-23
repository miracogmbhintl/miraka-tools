# Migrating from Webflow Cloudflare to Your Own Cloudflare Account

## Overview

Your app is already configured and ready to deploy to your own Cloudflare Workers account. This guide will walk you through the complete migration process.

## Prerequisites

1. **Cloudflare Account** (Free or Paid)
   - Sign up at: https://dash.cloudflare.com/sign-up
   - Free tier includes 100,000 requests/day (plenty for most use cases)

2. **Node.js & npm** (Already installed if running locally)
   - Verify: `node --version` (should be v18+)

3. **Git** (For version control)
   - Verify: `git --version`

---

## Step-by-Step Migration Guide

### Step 1: Install Wrangler CLI (Cloudflare's Deployment Tool)

Wrangler is already in your `package.json`, so just run:

```bash
npm install
```

Verify installation:
```bash
npx wrangler --version
```

### Step 2: Authenticate with Cloudflare

Log in to your Cloudflare account through Wrangler:

```bash
npx wrangler login
```

This will:
1. Open a browser window
2. Ask you to authorize Wrangler
3. Save credentials locally

**Troubleshooting**: If browser doesn't open, use:
```bash
npx wrangler login --browser=false
```
Then manually visit the URL shown.

### Step 3: Configure Your Worker Name (Optional)

The default name is `astro`. You can customize it in `wrangler.jsonc`:

```jsonc
{
  "name": "miraka-tools",  // Change this to your preferred name
  // ... rest of config
}
```

**Worker URL**: Your app will be accessible at:
```
https://miraka-tools.<your-account>.workers.dev
```

Or configure a custom domain later (see Step 7).

### Step 4: Set Environment Variables

Add your OpenAI API key as a **secret** (encrypted):

```bash
npx wrangler secret put OPENAI_API_KEY
```

When prompted, paste your OpenAI API key (starts with `sk-`).

**Verify secrets:**
```bash
npx wrangler secret list
```

### Step 5: Build Your App

Build the production version:

```bash
npm run build
```

This creates optimized files in the `dist` folder.

**Expected output:**
```
✓ Built in XXXms
✓ Worker bundled
```

### Step 6: Deploy to Cloudflare

Deploy your app:

```bash
npx wrangler deploy
```

**What happens:**
1. Uploads your built app to Cloudflare
2. Configures the Worker
3. Provides your live URL

**Expected output:**
```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded miraka-tools (X.XX sec)
Published miraka-tools (X.XX sec)
  https://miraka-tools.<your-account>.workers.dev
```

🎉 **Your app is now live!**

### Step 7: Set Up Custom Domain (Optional but Recommended)

#### Option A: Use Cloudflare Workers Domain

Free subdomain: `https://your-app.workers.dev`

#### Option B: Use Your Own Domain

1. **Add domain to Cloudflare** (if not already)
   - Go to Cloudflare Dashboard → Add Site
   - Follow DNS setup instructions

2. **Add route to Worker**
   ```bash
   npx wrangler deploy --routes "tools.yourdomain.com/*"
   ```

3. **Or configure in `wrangler.jsonc`:**
   ```jsonc
   {
     "name": "miraka-tools",
     "routes": [
       { "pattern": "tools.yourdomain.com/*", "zone_name": "yourdomain.com" }
     ]
   }
   ```

4. **Redeploy:**
   ```bash
   npx wrangler deploy
   ```

---

## Configuration Options

### Environment Variables

Add non-secret environment variables in `wrangler.jsonc`:

```jsonc
{
  "name": "miraka-tools",
  "vars": {
    "ENVIRONMENT": "production",
    "LOG_LEVEL": "info"
  }
}
```

**Secrets** (encrypted) - use CLI:
```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put DATABASE_URL
```

### Multiple Environments

Create environment-specific configurations:

```jsonc
{
  "name": "miraka-tools",
  "main": "./dist/_worker.js/index.js",
  
  // Production environment (default)
  "vars": {
    "ENVIRONMENT": "production"
  },
  
  // Staging environment
  "env": {
    "staging": {
      "name": "miraka-tools-staging",
      "vars": {
        "ENVIRONMENT": "staging"
      }
    }
  }
}
```

**Deploy to staging:**
```bash
npx wrangler deploy --env staging
```

### Resource Limits

Cloudflare Workers limits (Free tier):
- **CPU Time**: 10ms per request
- **Memory**: 128 MB
- **Requests**: 100,000/day
- **Duration**: 30 seconds max

For higher limits, upgrade to Workers Paid ($5/month for 10 million requests).

---

## Continuous Deployment (CI/CD)

### Option 1: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          secrets: |
            OPENAI_API_KEY
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

**Setup:**
1. Get Cloudflare API Token:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create Token → "Edit Cloudflare Workers" template
   - Copy the token

2. Add to GitHub Secrets:
   - Go to your repo → Settings → Secrets → Actions
   - Add `CLOUDFLARE_API_TOKEN`
   - Add `OPENAI_API_KEY`

3. Push to `main` branch - auto-deploys! 🚀

### Option 2: Manual Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🔨 Building app..."
npm run build

echo "🚀 Deploying to Cloudflare..."
npx wrangler deploy

echo "✅ Deployment complete!"
echo "🌐 Visit: https://miraka-tools.<your-account>.workers.dev"
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Monitoring & Debugging

### View Live Logs

Stream real-time logs from your Worker:

```bash
npx wrangler tail
```

This shows:
- All requests
- Console.log outputs
- Errors and exceptions
- Performance metrics

**Filter logs:**
```bash
npx wrangler tail --status error  # Only errors
npx wrangler tail --method POST   # Only POST requests
```

### Cloudflare Dashboard

Monitor your Worker at:
https://dash.cloudflare.com/

**Analytics available:**
- Request count
- Error rate
- CPU time
- Bandwidth usage
- Geographic distribution

### Debug Locally

Test your production build locally:

```bash
npm run preview
```

This runs Wrangler in dev mode with your built app.

---

## Cost Comparison

### Webflow Cloudflare (Current)
- Managed by Webflow
- Environment variable setup unclear
- Limited control

### Your Own Cloudflare (Migrated)
| Plan | Cost | Requests/Day | Features |
|------|------|--------------|----------|
| **Free** | $0 | 100,000 | Full features, more than enough for most apps |
| **Paid** | $5/mo | 333,000+ (10M/month) | Higher limits, SLA |

**OpenAI Costs** (gpt-4o-mini):
- ~$0.0006 per website analysis
- $10 = ~16,600 analyses
- Very affordable!

---

## Migration Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Authenticate with Cloudflare (`npx wrangler login`)
- [ ] (Optional) Customize worker name in `wrangler.jsonc`
- [ ] Add OpenAI API key (`npx wrangler secret put OPENAI_API_KEY`)
- [ ] Build app (`npm run build`)
- [ ] Deploy app (`npx wrangler deploy`)
- [ ] Test live URL
- [ ] (Optional) Set up custom domain
- [ ] (Optional) Configure CI/CD
- [ ] Update any external links/integrations

---

## Rollback Plan

If something goes wrong, you can:

1. **Redeploy previous version:**
   ```bash
   npx wrangler rollback
   ```

2. **Check deployment history:**
   ```bash
   npx wrangler deployments list
   ```

3. **Delete Worker:**
   ```bash
   npx wrangler delete
   ```

---

## Advanced Features

### 1. Caching

Add caching to improve performance:

```typescript
// In your API routes
const cache = await caches.open('website-intelligence');
const cacheKey = new Request(url);
const cachedResponse = await cache.match(cacheKey);

if (cachedResponse) {
  return cachedResponse;
}

// ... do analysis ...

// Cache for 24 hours
response.headers.set('Cache-Control', 'max-age=86400');
await cache.put(cacheKey, response.clone());
```

### 2. Rate Limiting

Add to `wrangler.jsonc`:

```jsonc
{
  "name": "miraka-tools",
  "limits": {
    "cpu_ms": 50  // Limit CPU time per request
  }
}
```

Or use Cloudflare's built-in rate limiting rules.

### 3. Durable Objects (State Storage)

For persistent storage:

```bash
npx wrangler d1 create miraka-tools-db
```

### 4. R2 Object Storage (File Storage)

For storing PDFs, reports, etc.:

```bash
npx wrangler r2 bucket create miraka-tools-files
```

---

## Troubleshooting

### "Not authenticated" error
```bash
npx wrangler login
```

### "Secret not found" error
```bash
npx wrangler secret put OPENAI_API_KEY
```

### Build errors
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Deployment fails
1. Check `wrangler.jsonc` syntax (must be valid JSON)
2. Ensure you're logged in
3. Check Worker name doesn't conflict

### App works locally but not in production
1. Check environment variables are set as secrets
2. View live logs: `npx wrangler tail`
3. Check Cloudflare dashboard for errors

---

## Support Resources

- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Cloudflare Discord**: https://discord.gg/cloudflaredev
- **Astro Cloudflare Docs**: https://docs.astro.build/en/guides/integrations-guide/cloudflare/

---

## Next Steps After Migration

1. **Test all features** on your live URL
2. **Update any links** pointing to old Webflow URL
3. **Set up monitoring** and alerts
4. **Configure CI/CD** for automatic deployments
5. **Add custom domain** for professional URL
6. **Monitor costs** in Cloudflare and OpenAI dashboards

---

🎉 **Congratulations!** You now have full control over your deployment with your own Cloudflare account!

For any issues, check the troubleshooting section or reach out to Cloudflare support.
